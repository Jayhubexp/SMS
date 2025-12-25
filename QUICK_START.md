# Quick Start Guide - New Features

## 🎯 Quick Navigation

### For Managing Directors & System Administrators

#### 1. Create a New Class
```
1. Go to: Classes Menu (Left Sidebar)
2. Click: "+" button (top right)
3. Fill in:
   - Class Name (e.g., "Form 1A")
   - Capacity (e.g., "45")
   - Grade Level (select from dropdown)
   - Supervisor/Teacher (optional)
4. Click: "Create"
```

#### 2. Record a Student Payment
```
1. Go to: Finance → Receipts (Left Sidebar)
2. Click: "+" or "Record Payment" button
3. Search for student by:
   - Option A: First Name + Last Name
   - Option B: Student ID (e.g., MSL/2024/0007)
4. Select student from results
5. Review balance information:
   - Total Fee (Gross)
   - Applied Discounts
   - Amount Already Paid
   - Outstanding Balance
6. Enter:
   - Amount Paying Now
   - Payment Method (Cash/Mobile/Bank)
   - Fee Type (Academic/Books/etc)
7. Click: "Generate Receipt"
8. Print or download receipt
```

#### 3. Create a Discount
```
1. Go to: Finance → Fees (Left Sidebar)
2. Look for "Manage Discounts" section
3. Click: Create Discount
4. Enter:
   - Discount Name (e.g., "Scholarship")
   - Type: Percentage (%) or Fixed (GHS)
   - Value (e.g., 25 for 25% or 100 for GHS 100)
   - Apply to: Specific student OR all students
5. Click: "Create"
```

#### 4. View Financial Reports

**By Student:**
```
1. Go to: Finance → Reports
2. Scroll to: "Finance Reports by Student"
3. Click: "View Report" next to student name
4. See: Student's fees, payments, discounts, balance
```

**By Class:**
```
1. Go to: Finance → Reports
2. Scroll to: "Finance Reports by Class"
3. Click: "View Report" next to class name
4. See: All students in class with individual balances
5. See: Class-wide totals (total billed, paid, outstanding)
```

---

### For Secretaries

**Same Access As Managing Directors For:**
- ✅ Create/Update/Delete Classes
- ✅ Record Student Payments
- ✅ Create/Manage Discounts
- ✅ View Financial Reports

**Additional Responsibilities:**
- Set up Academic Years and Terms
- Create Fee Types
- Manage fee structures per class

#### Set Up Academic Year
```
1. Go to: Finance → Academic Year Setup
2. Click: Create Academic Year
3. Enter:
   - Year Name (e.g., "2024/2025")
   - Start Date
   - End Date
4. Click: "Create"
```

#### Create Terms (Term 1, 2, 3)
```
1. Go to: Finance → Term Setup
2. Click: Create Term
3. Select:
   - Academic Year
   - Term Name (Term 1, Term 2, or Term 3)
4. Enter:
   - Start Date
   - End Date
5. Click: "Create"
```

#### Create Fee Types
```
1. Go to: Finance → Fee Types
2. Click: Create Fee Type
3. Enter:
   - Fee Type Name (e.g., "Uniform Costs")
   - Description (optional)
4. Click: "Create"
```

---

### For Other Users (Teachers, Parents, Students)

#### Search Student Info
```
1. Go to: Students Menu
2. Partial student list visible with search
3. Click: Student name to view details
4. If you have permission, see payment status
```

#### View Your Own Information
```
1. Go to: Profile
2. See your personal information
3. (Students) See your class assignment
4. (Parents) See linked student information
```

---

## 📊 Understanding the Finance Dashboard

### Total Payable Calculation

```
┌─────────────────────────────────┐
│ Total Fees (Gross)              │
│ (All assigned fees)             │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ MINUS: Discounts Applied        │
│ (Scholarship, early pay, etc)   │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ EQUALS: Total Due (Gross)       │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ MINUS: Amount Paid So Far       │
│ (Previous payments recorded)    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ EQUALS: Outstanding Balance     │
│ (Amount still owed)             │
└─────────────────────────────────┘
```

### Example:

```
Student: John Doe
Class: Form 1A

Fee Breakdown:
├── Academic Fees (Term 1)      = GHS 500
├── Book Fees                    = GHS 100
└── Sports/P.E Fees             = GHS 75
                 TOTAL FEES = GHS 675

Discounts:
├── Scholarship (15%)            = -GHS 101.25
                 TOTAL DISCOUNT = GHS 101.25

Amount Due = GHS 675 - GHS 101.25 = GHS 573.75

Payments:
├── Payment on 2024-01-15        = GHS 200
├── Payment on 2024-02-20        = GHS 150
                 TOTAL PAID = GHS 350

Outstanding Balance = GHS 573.75 - GHS 350 = GHS 223.75
```

---

## 🔍 Student ID Format

### What It Looks Like:
`MSL/2024/0007`

### Breaking It Down:
- `MSL` = School prefix
- `2024` = Year admitted
- `0007` = Auto-incrementing number per year

### Examples:
```
First student admitted in 2024:    MSL/2024/0001
Second student admitted in 2024:   MSL/2024/0002
...
Seventh student admitted in 2024:  MSL/2024/0007

First student admitted in 2025:    MSL/2025/0001
Second student admitted in 2025:   MSL/2025/0002
```

### How It's Generated:
- **Automatic** when student is created
- **Unique** - no duplicates allowed
- **Ordered** - sequential per academic year
- **Not editable** - fixed once created

---

## 🔐 Access Control Matrix

| Feature | Student | Parent | Teacher | Secretary | MD | Sys Admin |
|---------|---------|--------|---------|-----------|----|----|
| View Classes | ✅ Own | ❌ | ✅ Own | ✅ All | ✅ All | ✅ All |
| Manage Classes | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Search Students | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Record Payments | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Fees | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| View Own Report | ✅ | ✅ Own Child | ✅ Own Class | ✅ | ✅ | ✅ |
| View All Reports | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Discounts | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## 🐛 Common Issues & Solutions

### "Student ID not found when searching"
**Solution:**
1. Check the exact student ID format: `MSL/YYYY/NNNN`
2. Student ID is case-sensitive
3. Verify student exists in the system
4. Try searching by name instead

### "Balance calculation looks wrong"
**Checklist:**
1. Are all fees assigned to student? (Check fee assignments)
2. Are discounts correctly applied? (Check active discounts)
3. Are all payments recorded? (Check payment history)
4. Is student in the right class? (Check class assignment)

### "Can't create class - permission denied"
**Solution:**
- Only MD, Secretary, System Admin can create classes
- Ask your system administrator to promote your account
- Or contact MD if you're authorized

### "Receipt not generating"
**Troubleshooting:**
1. Verify student selected
2. Verify amount entered is > 0
3. Verify payment method selected
4. Check browser console for errors
5. Ensure sufficient database permissions

### "Discount not applied to fee"
**Check:**
1. Discount must be created first
2. Discount must be linked to either:
   - Specific student ID, OR
   - Specific fee structure
3. If linking to fee structure, fee must be assigned to student

---

## 📝 Data Entry Tips

### When Creating a Class:
- ✅ Use clear names (e.g., "Form 1A", not "F1A")
- ✅ Capacity should be realistic (30-50 typical)
- ✅ Always assign a grade level
- ✅ Supervisor (teacher) is optional but recommended

### When Recording Payments:
- ✅ Search thoroughly before saying "student not found"
- ✅ Double-check amount entered
- ✅ Match payment method to actual payment received
- ✅ Select correct fee type being paid for

### When Creating Discounts:
- ✅ Use descriptive names (e.g., "2024 Scholarship Program")
- ✅ Set realistic percentages (10-50% typical)
- ✅ Fixed discounts in GHS currency
- ✅ Link to specific student if personal discount
- ✅ Leave blank if applies to all students

---

## 📱 Mobile Usage

The system is responsive and works on:
- ✅ Desktop browsers
- ✅ Tablets (iPad, Android tablets)
- ✅ Mobile phones (optimal view)

**Best for Mobile:**
- Searching students
- Recording single payment
- Quick balance checks

**Better on Desktop:**
- Creating classes
- Managing multiple records
- Financial reporting & analysis

---

## ⌨️ Keyboard Shortcuts

While typing in search fields:
- `Enter` = Execute search
- `Escape` = Close modal
- `Tab` = Next field

---

## 🆘 Getting Help

If you encounter issues:

1. **Check Console Logs:**
   - Press F12 → Console tab
   - Look for red error messages
   - Take screenshot if needed

2. **Verify Data:**
   - Ensure all required fields filled
   - Check database connection
   - Verify user permissions

3. **Clear Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache in settings

4. **Contact Support:**
   - System Administrator
   - Check IMPLEMENTATION_GUIDE.md for details

---

## 📚 Related Documentation

- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Detailed technical docs
- [Database Schema](./DATABASE_SCHEMA.md) - Table structures (recommended to create)
- README.md - Project overview

---

**Last Updated:** December 23, 2025
**Version:** 1.0
**Status:** Ready to Use
