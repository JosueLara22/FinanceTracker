/**
 * Investment Migration Utility
 *
 * Handles existing investments that were created before the account integration feature.
 * These investments will have undefined sourceAccountId.
 */

import { db } from '../data/db';
import { Investment } from '../types';

/**
 * Check if there are any investments without a source account
 */
export async function hasUnlinkedInvestments(): Promise<boolean> {
  const investments = await db.investments.toArray();
  return investments.some(inv => !inv.sourceAccountId);
}

/**
 * Get all investments that don't have a source account linked
 */
export async function getUnlinkedInvestments(): Promise<Investment[]> {
  const investments = await db.investments.toArray();
  return investments.filter(inv => !inv.sourceAccountId);
}

/**
 * Get count of unlinked investments
 */
export async function getUnlinkedInvestmentsCount(): Promise<number> {
  const unlinked = await getUnlinkedInvestments();
  return unlinked.length;
}

/**
 * Link an investment to a source account (for migration purposes)
 * Note: This does NOT deduct money from the account, as the investment was already created.
 * This is purely for record-keeping and future tracking.
 */
export async function linkInvestmentToAccount(
  investmentId: string,
  sourceAccountId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const investment = await db.investments.get(investmentId);

    if (!investment) {
      return { success: false, error: 'Investment not found' };
    }

    // Check if account exists
    const account = await db.accounts.get(sourceAccountId);
    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Update the investment with the source account
    await db.investments.update(investmentId, {
      sourceAccountId
    });

    return { success: true };
  } catch (error) {
    console.error('Error linking investment to account:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Skip migration for an investment (mark it as intentionally unlinked)
 * We don't actually mark it, but this function exists for consistency
 */
export async function skipInvestmentMigration(): Promise<boolean> {
  // For now, we just return true. The investment will remain with undefined sourceAccountId
  // which is perfectly valid (represents manual entry)
  return true;
}

/**
 * Get migration status summary
 */
export async function getMigrationStatus(): Promise<{
  total: number;
  linked: number;
  unlinked: number;
  needsMigration: boolean;
}> {
  const investments = await db.investments.toArray();
  const total = investments.length;
  const linked = investments.filter(inv => inv.sourceAccountId).length;
  const unlinked = investments.filter(inv => !inv.sourceAccountId).length;

  return {
    total,
    linked,
    unlinked,
    needsMigration: unlinked > 0
  };
}

/**
 * Check if user should see migration prompt
 * (Has investments AND has unlinked investments)
 */
export async function shouldShowMigrationPrompt(): Promise<boolean> {
  const status = await getMigrationStatus();
  return status.total > 0 && status.needsMigration;
}

/**
 * Bulk link multiple investments to accounts
 */
export async function bulkLinkInvestments(
  links: Array<{ investmentId: string; sourceAccountId: string }>
): Promise<{
  success: boolean;
  successCount: number;
  failCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const link of links) {
    const result = await linkInvestmentToAccount(link.investmentId, link.sourceAccountId);

    if (result.success) {
      successCount++;
    } else {
      failCount++;
      errors.push(`Investment ${link.investmentId}: ${result.error}`);
    }
  }

  return {
    success: failCount === 0,
    successCount,
    failCount,
    errors
  };
}
