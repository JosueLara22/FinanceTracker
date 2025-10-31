# 📋 Financial Tracker Application - Detailed Project Specification for Claude Code

## 🎯 Project Overview

Create a comprehensive personal finance tracking application with a modern web interface that tracks expenses, savings, credit cards, bank accounts, and investments (specifically Mexican fintechs: Nu, Didi, and Mercado Pago). The system should work both online and offline, with local data storage and export capabilities.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API + useReducer
- **Data Persistence**: LocalStorage with IndexedDB for larger datasets
- **Charts**: Recharts for visualizations
- **Export**: Excel generation using SheetJS
- **PWA**: Progressive Web App for mobile installation

### Project Structure
```
financial-tracker/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── Expenses/
│   │   ├── Investments/
│   │   ├── Budget/
│   │   ├── Accounts/
│   │   └── common/
│   ├── contexts/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   └── data/
├── public/
└── package.json
```

## 📊 Data Models

### Core Entities

```typescript
// 1. Income
interface Income {
  id: string;
  date: Date;
  amount: number;
  category: string; // e.g., Salary, Freelance, Gift, Investment Income
  description: string;
  source: string; // e.g., Employer, Client, Bank
  recurring?: boolean;
  attachments?: string[]; // e.g., pay stubs
}

// 2. Expense
interface Expense {
  id: string;
  date: Date;
  amount: number;
  category: string;
  subcategory?: string;
  description: string;
  paymentMethod: string;
  tags?: string[];
  recurring?: boolean;
  attachments?: string[]; // base64 images of receipts
}

// 2. Investment (Mexican Fintech)
interface Investment {
  id: string;
  platform: 'Nu' | 'Didi' | 'MercadoPago' | 'Other';
  type: string; // 'Cajita', 'Inversión', etc.
  initialCapital: number;
  startDate: Date;
  gatPercentage: number; // Annual GAT%
  dailyReturn: number; // Calculated
  accumulatedReturns: number;
  currentValue: number;
  lastUpdate: Date;
  autoReinvest: boolean;
}

// 3. BankAccount
interface BankAccount {
  id: string;
  bank: string;
  accountType: 'checking' | 'savings' | 'investment';
  accountNumber: string; // Last 4 digits only
  balance: number;
  currency: 'MXN' | 'USD';
  lastUpdate: Date;
  isActive: boolean;
}

// 4. CreditCard
interface CreditCard {
  id: string;
  bank: string;
  cardName: string;
  lastFourDigits: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  cutoffDate: number; // Day of month
  paymentDate: number; // Day of month
  interestRate: number;
}

// 5. Budget
interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  period: string; // 'YYYY-MM'
  spent: number; // Calculated from expenses
  alertThreshold: number; // Percentage (e.g., 80)
}

// 6. SavingsGoal
interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  priority: 'low' | 'medium' | 'high';
  autoContribution?: number; // Monthly auto-save amount
  linkedAccount?: string; // Account ID
}
```

## 🖥️ User Interface Components

### 1. Dashboard View
- **Summary Cards**:
  - Net Worth (Total Assets - Total Liabilities)
  - Monthly Cash Flow (Income - Expenses)
  - Investment Performance (Total ROI %)
  - Budget Status (Used vs Available)
  - Savings Progress (Goals completion %)

- **Charts**:
  - Expense trend (Last 6 months line chart)
  - Category breakdown (Pie chart)
  - Investment performance (Stacked area chart)
  - Net worth evolution (Line chart)

- **Quick Actions**:
  - Add Expense button
  - Add Income button
  - Quick Transfer
  - Update Investment Returns

### 2. Expense Tracker
- **Features**:
  - Quick entry form with autocomplete
  - Category suggestions based on description
  - Receipt photo capture (mobile)
  - Recurring expense templates
  - Bulk import from bank statements (CSV)
  
- **Views**:
  - Calendar view with daily totals
  - List view with filters
  - Category analysis view

### 3. Income Tracker
- **Features**:
  - Quick entry form for income sources
  - Categorization of income (e.g., Salary, Freelance, Bonus)
  - Recurring income setup
  - Link income to bank accounts

- **Views**:
  - List view with filters (by source, category, date)
  - Monthly/Annual income summary
  - Income trend analysis

### 4. Investment Manager (Mexican Fintech Focus)
- **Platform Cards** for Nu, Didi, MercadoPago:
  - Current balance with daily returns
  - GAT percentage display
  - ROI calculation and comparison
  - Daily returns tracker
  - Projected annual returns

- **Features**:
  - Auto-calculate daily returns based on GAT
  - Compare returns across platforms
  - Investment suggestions based on rates
  - Compound interest calculator
  - Historical performance graphs

### 5. Budget Planner
- **Monthly Budget**:
  - Category-wise allocation
  - Real-time spending tracking
  - Visual progress bars
  - Alerts when approaching limits
  - Recommendations based on history

- **Features**:
  - Zero-based budgeting option
  - Envelope method support
  - Rollover unused budget option
  - Budget vs Actual comparison

### 6. Accounts Overview
- **Bank Accounts Section**:
  - Card-based layout
  - Quick balance update
  - Transaction history link
  - Transfer between accounts

- **Credit Cards Section**:
  - Utilization percentage
  - Payment due reminders
  - Interest calculator
  - Minimum payment warnings

### 7. Reports & Analytics
- **Monthly Report**:
  - Income vs Expenses
  - Category breakdown
  - YoY comparison
  - Saving rate
  - Investment performance

- **Custom Reports**:
  - Date range selector
  - Exportable to PDF/Excel
  - Printable format
  - Email scheduling

## 🔧 Key Features

### Data Entry
1. **Smart Quick Entry**:
   - Natural language processing ("Comida 150 pesos en restaurante")
   - Voice input support
   - Barcode scanning for products
   - GPS-based merchant suggestions

2. **Bulk Operations**:
   - CSV import with mapping
   - Batch categorization
   - Multi-select actions
   - Find and replace

### Synchronization
1. **Local-First Architecture**:
   - All data stored locally
   - Works offline completely
   - Instant performance
   - No server dependencies

2. **Export/Import**:
   - Excel export with multiple sheets
   - JSON backup/restore
   - Google Sheets integration
   - PDF reports

### Mexican Fintech Integration
1. **GAT Tracking**:
   - Daily returns calculation
   - Compound interest modeling
   - Platform comparison matrix
   - Rate change notifications

2. **Investment Optimizer**:
   - Suggest best platform based on amount and term
   - Diversification recommendations
   - Tax implications calculator (ISR)

### Security & Privacy
1. **Data Protection**:
   - Local encryption option
   - Biometric lock (mobile)
   - No cloud storage by default
   - Data anonymization for exports

2. **Backup Strategy**:
   - Automatic local backups
   - Encrypted export files
   - Version history (last 30 days)

## 📱 Mobile-First Features

### PWA Capabilities
- **Installation**: Add to home screen
- **Offline Mode**: Full functionality without internet
- **Notifications**: Bill reminders, budget alerts
- **Camera Access**: Receipt scanning
- **Widgets**: Quick expense entry

### Mobile-Specific UI
- **Bottom Navigation**: Easy thumb reach
- **Swipe Gestures**: Quick actions
- **Pull-to-Refresh**: Update balances
- **Floating Action Button**: Quick expense add

## 🎨 Design System

### Color Palette
```css
Success: #4CAF50 (Green)
Warning: #FFC107 (Amber)
Danger: #F44336 (Red)
Info: #2196F3 (Blue)
```

### Component Library
- **Cards**: Elevated with subtle shadows
- **Buttons**: Gradient backgrounds, ripple effects
- **Forms**: Floating labels, inline validation
- **Charts**: Consistent color scheme
- **Icons**: Lucide React icon set

## 🔄 State Management

### Global State Structure
```typescript
interface AppState {
  user: UserSettings;
  expenses: Expense[];
  incomes: Income[];
  investments: Investment[];
  accounts: BankAccount[];
  creditCards: CreditCard[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  categories: Category[];
  ui: UIState;
}
```

### Actions
- CRUD operations for all entities
- Bulk updates
- Calculate derived values
- Filter/Sort operations
- Export/Import data

## 🧮 Calculations Engine

### Key Formulas
1. **Net Worth**: 
   ```
   Total Bank Accounts + Total Investments + Total Savings + Total Income - Total Credit Card Debt

2. **Monthly Cash Flow**:
   ```
   Total Income - Total Expenses
   ```

3. **Daily Investment Return**:
   ```
   (Initial Capital × GAT% / 365)
   ```

4. **ROI**:
   ```
   ((Current Value - Initial Investment) / Initial Investment) × 100
   ```

5. **Budget Usage**:
   ```
   (Category Expenses / Budget Limit) × 100
   ```

6. **Savings Goal Progress**:
   ```
   (Current Amount / Target Amount) × 100
   ```

## 🚀 Implementation Phases

### Phase 1: Core Foundation (Week 1)
- Project setup with React + TypeScript
- Basic component structure
- Data models and types
- LocalStorage integration
- Basic Dashboard UI

### Phase 2: Expense Tracking (Week 1-2)
- Expense entry form
- Category management
- Expense list with filters
- Basic reporting
- Search functionality

### Phase 3: Income Tracking (Week 2)
- Income entry form
- Income category management
- Income list with filters
- Basic income reporting

### Phase 4: Financial Accounts (Week 2)
- Bank accounts CRUD
- Credit cards management
- Balance tracking
- Account overview dashboard

### Phase 5: Mexican Fintech Investments (Week 2-3)
- Investment tracker for Nu/Didi/MercadoPago
- GAT calculator
- ROI comparisons
- Daily returns tracking
- Investment dashboard

### Phase 6: Budget & Goals (Week 3)
- Budget creation and tracking
- Savings goals manager
- Progress visualizations
- Alert system
- Recommendations engine

### Phase 7: Analytics & Reports (Week 3-4)
- Chart integrations
- Monthly/Annual reports
- Export functionality (Excel/PDF)
- Custom report builder

### Phase 8: Mobile Optimization (Week 4)
- PWA configuration
- Responsive refinements
- Touch gestures
- Offline capabilities
- Performance optimization

### Phase 9: Polish & Testing (Week 4)
- UI/UX improvements
- Error handling
- Data validation
- User onboarding
- Documentation

## 🧪 Testing Requirements

### Unit Tests
- Calculation functions
- Data transformations
- Validation logic
- State reducers

### Integration Tests
- Data persistence
- Import/Export
- State management
- Component interactions

### E2E Tests
- Critical user flows
- Data entry scenarios
- Report generation
- Offline functionality

## 📚 Additional Considerations

### Localization
- Spanish as primary language
- Mexican currency formatting
- Local date formats
- Tax terminology (ISR, IVA)

### Performance
- Lazy loading for large datasets
- Virtual scrolling for lists
- Memoization for expensive calculations
- Code splitting by route

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode

### Future Enhancements
- Bank API integration (when available)
- Bill scanning with OCR
- Collaborative features (family sharing)
- AI-powered insights
- Cryptocurrency tracking
- Real estate investments

## 🎯 Success Criteria

1. **Performance**: App loads in <2 seconds, instant interactions
2. **Reliability**: Zero data loss, accurate calculations
3. **Usability**: Expense entry in <10 seconds
4. **Coverage**: Tracks 100% of financial aspects
5. **Mobile**: Works flawlessly on phones
6. **Offline**: Full functionality without internet
7. **Export**: Complete data portability

## 📝 Development Notes

### Priority Order
1. Core data models and storage
2. Expense tracking (most used feature)
3. Income tracking
4. Dashboard with basic metrics
5. Investment tracking (unique value prop)
6. Budget management
7. Reports and analytics
8. Polish and optimizations

### Key Technical Decisions
- Use IndexedDB through Dexie.js for better performance with large datasets
- Implement service worker early for offline capability
- Use React.lazy() for code splitting from the start
- Set up TypeScript strictly to catch errors early
- Use Zustand instead of Context API if state gets complex

### Testing Strategy
- Test financial calculations extensively
- Mock LocalStorage/IndexedDB for unit tests
- Use React Testing Library for components
- Cypress for E2E tests
- Test offline scenarios thoroughly

---

This specification provides a complete blueprint for implementing a professional-grade financial tracking application tailored for Mexican users, with particular emphasis on local fintech platforms and mobile usability.
