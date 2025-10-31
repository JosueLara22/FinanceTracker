## Detailed Plan: Adding UI for Account and Category Management

### 1. Goal

To provide user interfaces within the Financial Tracker application for adding, viewing, and managing bank accounts and expense/income categories. This will enhance the application's usability by allowing users to customize their financial tracking directly through the UI, rather than relying solely on programmatic defaults.

### 2. Core Principles

*   **Modularity:** Create new components that are self-contained and focused on a single responsibility (e.g., `AccountForm`, `AccountList`, `CategoryForm`, `CategoryList`).
*   **Reusability:** Design components with reusability in mind where appropriate.
*   **Consistency:** Adhere to the existing design aesthetic and Tailwind CSS conventions.
*   **Accessibility:** Ensure new UI elements are accessible and keyboard-navigable.
*   **Data Integrity:** Utilize the existing `useAccounts` and `useCategories` hooks to ensure data is correctly persisted to the Dexie.js database.

### 3. Proposed Structure and Components

We will introduce two new main sections: "Accounts" and "Categories."

#### 3.1. Accounts Management

**Location:** `src/components/Accounts/`

**Components:**

*   **`src/components/Accounts/index.tsx` (Accounts Page/View):**
    *   Will serve as the main entry point for account management.
    *   Will display a list of existing bank accounts.
    *   Will include a button to toggle the visibility of the `AccountForm` for adding new accounts.
    *   Will utilize the `useAccounts` hook to fetch and display account data.
    *   Will provide actions (e.g., edit, delete) for individual accounts (initially, just display).
*   **`src/components/Accounts/AccountList.tsx`:**
    *   A presentational component responsible for rendering the list of `BankAccount` items.
    *   Will receive `accounts` data as props.
    *   Each account item will display `bank`, `accountType`, and `balance`.
    *   Will include buttons for `onEditAccount` and `onDeleteAccount` (callbacks passed as props).
*   **`src/components/Accounts/AccountForm.tsx`:**
    *   A form component for adding new `BankAccount` entries.
    *   Will include input fields for:
        *   `bank` (text input)
        *   `accountType` (select dropdown: e.g., 'Checking', 'Savings', 'Credit Card', 'Investment')
        *   `balance` (number input)
    *   Will use `useState` to manage form input.
    *   Will call `addAccount` from `useAccounts` on form submission.
    *   Will include a "Cancel" button to hide the form.

#### 3.2. Categories Management

**Location:** `src/components/Categories/`

**Components:**

*   **`src/components/Categories/index.tsx` (Categories Page/View):**
    *   Will serve as the main entry point for category management.
    *   Will display a list of existing categories (both expense and income).
    *   Will include a button to toggle the visibility of the `CategoryForm` for adding new categories.
    *   Will utilize the `useCategories` hook to fetch and display category data.
    *   Will provide actions (e.g., edit, delete) for individual categories (initially, just display).
*   **`src/components/Categories/CategoryList.tsx`:**
    *   A presentational component responsible for rendering the list of `Category` items.
    *   Will receive `categories` data as props.
    *   Each category item will display `name`, `type`, and `icon`.
    *   Will include buttons for `onEditCategory` and `onDeleteCategory` (callbacks passed as props).
*   **`src/components/Categories/CategoryForm.tsx`:**
    *   A form component for adding new `Category` entries.
    *   Will include input fields for:
        *   `name` (text input)
        *   `type` (select dropdown: 'expense', 'income')
        *   `icon` (text input, e.g., emoji or simple text)
    *   Will use `useState` to manage form input.
    *   Will call `addCategory` from `useCategories` on form submission.
    *   Will include a "Cancel" button to hide the form.

### 4. Integration Steps

#### 4.1. Routing

*   **Introduce React Router:** Since the application currently renders all main sections directly in `App.tsx`, we will need to introduce a routing library (e.g., `react-router-dom`).
*   **Define Routes:**
    *   `/`: Dashboard (default)
    *   `/expenses`: Expenses
    *   `/investments`: Investments
    *   `/accounts`: Accounts Management
    *   `/categories`: Categories Management
*   **Update `App.tsx`:** Wrap the application with `BrowserRouter` and use `Routes` and `Route` components to define the navigation.

#### 4.3. Styling

*   **Tailwind CSS:** All new components will be styled using Tailwind CSS, adhering to the existing dark mode conventions.
*   **Contrast:** Pay close attention to contrast in both light and dark modes for all new UI elements, especially forms and lists.

### 5. Development Workflow (Iterative)

1.  **Implement Routing:** Set up `react-router-dom` in `App.tsx` and define basic routes.
2.  **Create Accounts Page:**
    *   Develop `AccountForm.tsx` and `AccountList.tsx`.
    *   Integrate them into `src/components/Accounts/index.tsx`.
    *   Add a navigation link in `Header.tsx`.
3.  **Create Categories Page:**
    *   Develop `CategoryForm.tsx` and `CategoryList.tsx`.
    *   Integrate them into `src/components/Categories/index.tsx`.
    *   Add a navigation link in `Header.tsx`.
4.  **Testing:**
    *   Manually test all new UI elements for functionality, styling, and dark mode compatibility.
    *   Consider adding Playwright tests for the new pages and forms to ensure they function as expected.

### 6. Potential Challenges / Considerations

*   **Routing Library Choice:** `react-router-dom` is a common and robust choice for React applications.
*   **Form Validation:** Implement basic client-side form validation for new forms.
*   **Error Handling:** Display user-friendly error messages for form submissions or data operations.
*   **Edit/Delete Functionality:** While the plan initially focuses on adding and displaying, implementing edit and delete for accounts and categories will be a natural next step. The `useAccounts` and `useCategories` hooks already provide `update` and `delete` functions.
*   **Empty States:** Provide clear messages when no accounts or categories are present.
