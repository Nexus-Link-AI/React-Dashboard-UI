import { db } from "./db";
import { validators, consensusRounds, validatorVotes, type Validator, type InsertValidator, type InsertConsensusRound, type InsertValidatorVote } from "@shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { nanoid } from "nanoid";

export class PoTCConsensusEngine {
  private readonly CONSENSUS_THRESHOLD = 67; // 67% threshold for consensus
  private readonly MIN_VALIDATORS = 3;
  private readonly ROUND_TIMEOUT = 30000; // 30 seconds
  private currentRound = 0;
  private isRunning = false;

  /**
   * Core PoTC Score Calculation
   * Formula: (Stake × Time Commitment) × Uptime × Reputation
   */
  calculatePotcScore(validator: Validator): number {
    const now = new Date();
    const commitmentStart = validator.startTime ? new Date(validator.startTime) : new Date();
    const commitmentEnd = validator.endTime ? new Date(validator.endTime) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Time commitment weight (exponential scaling for longer commitments)
    const commitmentHours = validator.commitmentDuration / 60;
    const timeWeight = Math.pow(commitmentHours / 24, 1.5); // Exponential scaling for days
    
    // Stake amount (base computational power)
    const stakeWeight = validator.stakeAmount / 10000; // Normalize to reasonable scale
    
    // Uptime factor (percentage as decimal)
    const uptimeWeight = validator.uptime / 100;
    
    // Reputation factor (percentage as decimal with historical performance)
    const reputationWeight = validator.reputation / 100;
    
    // Bonus for ongoing commitment (time elapsed / total commitment)
    const elapsedTime = now.getTime() - commitmentStart.getTime();
    const totalCommitment = commitmentEnd.getTime() - commitmentStart.getTime();
    const persistenceBonus = Math.min(elapsedTime / totalCommitment, 1);
    
    // Anti-slashing penalty
    const slashingPenalty = Math.pow(0.9, validator.slashingEvents);
    
    const potcScore = Math.floor(
      (stakeWeight * timeWeight) * uptimeWeight * reputationWeight * 
      (1 + persistenceBonus) * slashingPenalty * 1000
    );
    
    return Math.max(potcScore, 0);
  }

  /**
   * Update all validator PoTC scores
   */
  async updateValidatorScores(): Promise<void> {
    const activeValidators = await db
      .select()
      .from(validators)
      .where(eq(validators.status, "active"));

    for (const validator of activeValidators) {
      const newScore = this.calculatePotcScore(validator);
      await db
        .update(validators)
        .set({ potcScore: newScore })
        .where(eq(validators.id, validator.id));
    }
  }

  /**
   * Select validator for block proposal based on PoTC score
   * Higher scores have higher probability of selection
   */
  async selectProposer(): Promise<Validator | null> {
    await this.updateValidatorScores();
    
    const activeValidators = await db
      .select()
      .from(validators)
      .where(and(
        eq(validators.status, "active"),
        gte(validators.endTime, new Date())
      ))
      .orderBy(desc(validators.potcScore));

    if (activeValidators.length === 0) {
      return null;
    }

    // Weighted random selection based on PoTC scores
    const totalScore = activeValidators.reduce((sum, v) => sum + v.potcScore, 0);
    if (totalScore === 0) {
      return activeValidators[0]; // Fallback to highest stake if all scores are 0
    }

    const random = Math.random() * totalScore;
    let cumulativeScore = 0;

    for (const validator of activeValidators) {
      cumulativeScore += validator.potcScore;
      if (random <= cumulativeScore) {
        return validator;
      }
    }

    return activeValidators[0]; // Fallback
  }

  /**
   * Get eligible validators for consensus participation
   */
  async getEligibleValidators(minPotcScore: number = 100): Promise<Validator[]> {
    return await db
      .select()
      .from(validators)
      .where(and(
        eq(validators.status, "active"),
        gte(validators.potcScore, minPotcScore),
        gte(validators.endTime, new Date())
      ))
      .orderBy(desc(validators.potcScore));
  }

  /**
   * Start a new consensus round
   */
  async startConsensusRound(): Promise<number | null> {
    const proposer = await this.selectProposer();
    if (!proposer) {
      console.log("No eligible proposer found");
      return null;
    }

    const eligibleValidators = await this.getEligibleValidators();
    if (eligibleValidators.length < this.MIN_VALIDATORS) {
      console.log("Insufficient validators for consensus");
      return null;
    }

    this.currentRound++;
    const blockHash = nanoid(32); // Simulate block hash
    const minPotcScore = Math.min(...eligibleValidators.map(v => v.potcScore));

    const roundData: InsertConsensusRound = {
      roundNumber: this.currentRound,
      proposerValidatorId: proposer.validatorId,
      blockHash,
      validatorParticipants: eligibleValidators.map(v => v.validatorId),
      potcThreshold: minPotcScore,
      consensusReached: false,
      votesFor: 0,
      votesAgainst: 0,
    };

    const [round] = await db
      .insert(consensusRounds)
      .values(roundData)
      .returning();

    // Update proposer stats
    await db
      .update(validators)
      .set({ 
        blocksProposed: proposer.blocksProposed + 1,
        lastActivity: new Date()
      })
      .where(eq(validators.id, proposer.id));

    console.log(`Started consensus round ${this.currentRound} with proposer ${proposer.validatorId}`);
    return round.id;
  }

  /**
   * Submit validator vote
   */
  async submitVote(roundId: number, validatorId: string, vote: "for" | "against" | "abstain"): Promise<boolean> {
    const validator = await db
      .select()
      .from(validators)
      .where(eq(validators.validatorId, validatorId))
      .limit(1);

    if (validator.length === 0) {
      return false;
    }

    const votePower = validator[0].potcScore;
    const signature = nanoid(16); // Simulate cryptographic signature

    const voteData: InsertValidatorVote = {
      roundId,
      validatorId,
      vote,
      votePower,
      signature,
    };

    await db.insert(validatorVotes).values(voteData);

    // Update validator stats
    await db
      .update(validators)
      .set({ 
        blocksValidated: validator[0].blocksValidated + 1,
        lastActivity: new Date()
      })
      .where(eq(validators.id, validator[0].id));

    return true;
  }

  /**
   * Check if consensus is reached and finalize round
   */
  async checkConsensus(roundId: number): Promise<boolean> {
    const votes = await db
      .select()
      .from(validatorVotes)
      .where(eq(validatorVotes.roundId, roundId));

    const totalVotePower = votes.reduce((sum, vote) => sum + vote.votePower, 0);
    const forVotePower = votes
      .filter(vote => vote.vote === "for")
      .reduce((sum, vote) => sum + vote.votePower, 0);

    const consensusPercentage = totalVotePower > 0 ? (forVotePower / totalVotePower) * 100 : 0;
    const consensusReached = consensusPercentage >= this.CONSENSUS_THRESHOLD;

    // Update round with final results
    await db
      .update(consensusRounds)
      .set({
        consensusReached,
        votesFor: forVotePower,
        votesAgainst: totalVotePower - forVotePower,
        roundDuration: Date.now() % 100000, // Simplified duration
      })
      .where(eq(consensusRounds.id, roundId));

    if (consensusReached) {
      console.log(`Consensus reached for round ${roundId}: ${consensusPercentage.toFixed(1)}%`);
    }

    return consensusReached;
  }

  /**
   * Simulate validator behavior in consensus round
   */
  async simulateValidatorVotes(roundId: number): Promise<void> {
    const round = await db
      .select()
      .from(consensusRounds)
      .where(eq(consensusRounds.id, roundId))
      .limit(1);

    if (round.length === 0) return;

    const validatorIds = round[0].validatorParticipants as string[];
    
    for (const validatorId of validatorIds) {
      // Simulate vote based on validator reputation
      const validator = await db
        .select()
        .from(validators)
        .where(eq(validators.validatorId, validatorId))
        .limit(1);

      if (validator.length === 0) continue;

      // Higher reputation validators are more likely to vote "for"
      const voteForProbability = validator[0].reputation / 100;
      const vote = Math.random() < voteForProbability ? "for" : "against";

      await this.submitVote(roundId, validatorId, vote);
    }
  }

  /**
   * Run automated consensus simulation
   */
  async runConsensusSimulation(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log("Starting PoTC consensus simulation...");

    try {
      const roundId = await this.startConsensusRound();
      if (!roundId) {
        this.isRunning = false;
        return;
      }

      // Wait a moment then simulate votes
      setTimeout(async () => {
        await this.simulateValidatorVotes(roundId);
        
        // Check consensus after votes
        setTimeout(async () => {
          await this.checkConsensus(roundId);
          this.isRunning = false;
        }, 2000);
      }, 1000);
      
    } catch (error) {
      console.error("Consensus simulation error:", error);
      this.isRunning = false;
    }
  }

  /**
   * Slash validator for malicious behavior
   */
  async slashValidator(validatorId: string, reason: string): Promise<void> {
    const validator = await db
      .select()
      .from(validators)
      .where(eq(validators.validatorId, validatorId))
      .limit(1);

    if (validator.length === 0) return;

    const newReputation = Math.max(validator[0].reputation - 20, 0);
    const slashingEvents = validator[0].slashingEvents + 1;

    await db
      .update(validators)
      .set({
        reputation: newReputation,
        slashingEvents,
        status: slashingEvents >= 3 ? "slashed" : "active"
      })
      .where(eq(validators.id, validator[0].id));

    console.log(`Slashed validator ${validatorId}: ${reason}`);
  }

  /**
   * Get consensus statistics
   */
  async getConsensusStats() {
    const recentRounds = await db
      .select()
      .from(consensusRounds)
      .orderBy(desc(consensusRounds.roundNumber))
      .limit(10);

    const totalRounds = recentRounds.length;
    const successfulRounds = recentRounds.filter(r => r.consensusReached).length;
    const successRate = totalRounds > 0 ? (successfulRounds / totalRounds) * 100 : 0;

    const topValidators = await db
      .select()
      .from(validators)
      .where(eq(validators.status, "active"))
      .orderBy(desc(validators.potcScore))
      .limit(5);

    return {
      totalRounds,
      successfulRounds,
      successRate,
      currentRound: this.currentRound,
      topValidators,
      isSimulationRunning: this.isRunning
    };
  }
}

export const potcEngine = new PoTCConsensusEngine();