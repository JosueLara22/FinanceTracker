# Investment Feature Improvements - Implementation Plan

## Overview
Enhance the investment tracking system to provide automatic updates, accurate historical data, and better comparison tools.

## Goals
1. Automatic daily return calculations
2. Store historical snapshots for accurate data
3. Fix dailyReturn field inconsistency
4. Add platform comparison dashboard
5. Improve chart performance with real historical data

---

## Phase 1: Database Schema Enhancement

### Tasks
- [x] Add `InvestmentSnapshot` table to database schema
- [x] Update database migrations
- [x] Add snapshot CRUD operations

### Schema Addition
```typescript
interface InvestmentSnapshot {
  id: string;
  investmentId: string;
  date: Date;
  value: number;
  accumulatedReturns: number;
  dailyReturn: number;
  createdAt: Date;
}
```

---

## Phase 2: Automatic Daily Update System

### Tasks
- [x] Create investment calculation utility functions
- [x] Implement automatic update service
- [x] Add last calculation tracking
- [x] Create update scheduler (runs on app load)

### Features
- Check for missed days since lastUpdate
- Calculate and store daily snapshots
- Update investment currentValue and accumulatedReturns
- Store snapshots in InvestmentSnapshot table

---

## Phase 3: Fix dailyReturn Field

### Tasks
- [x] Update dailyReturn calculation logic
- [x] Make dailyReturn a computed property based on current value
- [x] Update InvestmentList to use dynamic calculation
- [x] Remove static dailyReturn from form calculation

---

## Phase 4: Historical Data Integration

### Tasks
- [x] Update InvestmentChart to use real snapshots
- [x] Add snapshot querying hook
- [x] Optimize chart data loading
- [x] Add date range filtering

---

## Phase 5: Platform Comparison Dashboard

### Tasks
- [x] Create InvestmentComparison component
- [x] Add comparison metrics (total ROI, average GAT, best performer)
- [x] Add sortable comparison table
- [x] Add visual indicators (best/worst performers)

### Metrics to Display
- Platform-wise total invested capital
- Platform-wise current value
- Platform-wise ROI %
- Average GAT % by platform
- Total returns by platform
- Performance ranking

---

## Phase 6: UI/UX Improvements

### Tasks
- [x] Remove "Update Returns" button (now automatic)
- [x] Add last update timestamp display
- [x] Add loading states for calculations
- [x] Add investment health indicators
- [ ] Add projection calculator (future value estimator)

---

## Phase 7: Performance Optimization

### Tasks
- [x] Lazy load historical snapshots
- [x] Add snapshot aggregation for long date ranges
- [ ] Implement virtual scrolling for investment list
- [x] Cache calculation results

---

## Phase 8: Testing & Validation

### Tasks
- [x] Test automatic update calculations
- [x] Validate compound vs simple interest accuracy
- [x] Test snapshot storage and retrieval
- [ ] Test chart performance with large datasets
- [x] Validate platform comparison accuracy

---

## Implementation Order

### Priority 1 (Core Fixes)
1. Database schema enhancement
2. Automatic daily update system
3. Fix dailyReturn field

### Priority 2 (Features)
4. Historical data integration
5. Platform comparison dashboard

### Priority 3 (Polish)
6. UI/UX improvements
7. Performance optimization
8. Testing & validation

---

## Technical Decisions

### Daily Update Trigger
- Run on app initialization
- Check all investments for missed days
- Process updates in background (non-blocking)
- Store results incrementally

### Snapshot Storage Strategy
- Store one snapshot per day per investment
- Keep all historical data (no auto-deletion)
- Query by date range for charts
- Use indexed queries on investmentId + date

### Performance Considerations
- Batch snapshot inserts
- Limit chart data points (max 365 days, sample if more)
- Use memoization for calculations
- Debounce update operations

---

## Success Criteria

1. ✅ Investments automatically update returns daily
2. ✅ Historical data accurately reflects past values
3. ✅ Chart loads quickly (<2s) even with years of data
4. ✅ Platform comparison provides actionable insights
5. ✅ No manual "Update Returns" button needed
6. ✅ ROI and return calculations are accurate to spec
7. ✅ UI clearly shows when last update occurred

---

## Files to Modify/Create

### New Files
- `src/types/investmentSnapshot.ts` - Snapshot type definitions
- `src/utils/investmentCalculations.ts` - Calculation utilities
- `src/services/investmentUpdateService.ts` - Automatic update service
- `src/hooks/useInvestmentSnapshots.ts` - Snapshot data hook
- `src/components/Investments/InvestmentComparison.tsx` - Comparison UI
- `src/components/Investments/InvestmentProjector.tsx` - Future value calculator

### Modified Files
- `src/data/db.ts` - Add snapshots table
- `src/types/index.ts` - Update Investment interface
- `src/stores/useInvestmentStore.ts` - Add snapshot operations
- `src/hooks/useInvestments.ts` - Integrate automatic updates
- `src/components/Investments/InvestmentList.tsx` - Remove manual update
- `src/components/Investments/InvestmentForm.tsx` - Fix dailyReturn
- `src/components/Dashboard/InvestmentChart.tsx` - Use real data
- `src/App.tsx` - Initialize update service

---

## Estimated Timeline
- Phase 1: 1 hour
- Phase 2: 2 hours
- Phase 3: 1 hour
- Phase 4: 1.5 hours
- Phase 5: 2 hours
- Phase 6: 1.5 hours
- Phase 7: 1 hour
- Phase 8: 1 hour

**Total: ~11 hours**

---

## Notes
- Backward compatibility: Existing investments will get snapshots generated retroactively
- Data migration: On first run, calculate all historical snapshots from startDate
- Error handling: Failed updates should not block app, log errors for debugging
- Future enhancement: Add export of historical data to Excel/CSV
