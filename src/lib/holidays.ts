// Philippine Holidays for College Students (2024-2026)
// Includes Regular Holidays, Special Non-Working Holidays, and School Breaks

export interface Holiday {
  date: string // YYYY-MM-DD
  name: string
  type: 'regular' | 'special' | 'school' | 'observance'
}

export function getPhilippineHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = []

  // Regular Holidays (Non-working)
  holidays.push(
    { date: `${year}-01-01`, name: "New Year's Day", type: 'regular' },
    { date: `${year}-04-09`, name: 'Day of Valor (Araw ng Kagitingan)', type: 'regular' },
    { date: `${year}-05-01`, name: 'Labor Day (Araw ng Manggagawa)', type: 'regular' },
    { date: `${year}-06-12`, name: 'Independence Day (Araw ng Kalayaan)', type: 'regular' },
    { date: `${year}-08-26`, name: 'National Heroes Day', type: 'regular' },
    { date: `${year}-11-30`, name: 'Bonifacio Day', type: 'regular' },
    { date: `${year}-12-25`, name: 'Christmas Day', type: 'regular' },
    { date: `${year}-12-30`, name: "Rizal Day", type: 'regular' },
  )

  // Special Non-Working Holidays
  holidays.push(
    { date: `${year}-02-25`, name: 'EDSA People Power Revolution', type: 'special' },
    { date: `${year}-08-21`, name: 'Ninoy Aquino Day', type: 'special' },
    { date: `${year}-11-01`, name: 'All Saints Day', type: 'special' },
    { date: `${year}-12-08`, name: 'Feast of the Immaculate Conception', type: 'special' },
    { date: `${year}-12-31`, name: 'Last Day of the Year', type: 'special' },
  )

  // Chinese New Year (movable - approximate)
  if (year === 2025) holidays.push({ date: '2025-01-29', name: 'Chinese New Year', type: 'special' })
  if (year === 2026) holidays.push({ date: '2026-02-17', name: 'Chinese New Year', type: 'special' })

  // Maundy Thursday & Good Friday (movable - Easter based)
  if (year === 2025) {
    holidays.push(
      { date: '2025-04-17', name: 'Maundy Thursday', type: 'regular' },
      { date: '2025-04-18', name: 'Good Friday', type: 'regular' },
      { date: '2025-04-19', name: 'Black Saturday', type: 'special' },
    )
  }
  if (year === 2026) {
    holidays.push(
      { date: '2026-04-02', name: 'Maundy Thursday', type: 'regular' },
      { date: '2026-04-03', name: 'Good Friday', type: 'regular' },
      { date: '2026-04-04', name: 'Black Saturday', type: 'special' },
    )
  }

  // School Semester Breaks (Typical CIIT/College Schedule)
  holidays.push(
    { date: `${year}-10-31`, name: 'Semester Break Starts', type: 'school' },
    { date: `${year}-11-02`, name: 'Semester Break', type: 'school' },
    { date: `${year}-12-20`, name: 'Christmas Break Starts', type: 'school' },
  )

  // Add end of year break
  if (year <= 2025) {
    holidays.push(
      { date: `${year}-12-25`, name: 'Christmas Break', type: 'school' },
      { date: `${year}-12-26`, name: 'Christmas Break', type: 'school' },
      { date: `${year}-12-27`, name: 'Christmas Break', type: 'school' },
      { date: `${year}-12-28`, name: 'Christmas Break', type: 'school' },
      { date: `${year}-12-29`, name: 'Christmas Break', type: 'school' },
    )
  }

  // Observances (not holidays but important for students)
  holidays.push(
    { date: `${year}-02-14`, name: "Valentine's Day", type: 'observance' },
    { date: `${year}-03-08`, name: 'International Womens Day', type: 'observance' },
    { date: `${year}-10-31`, name: "Halloween", type: 'observance' },
    { date: `${year}-11-01`, name: 'All Souls Day', type: 'observance' },
  )

  return holidays
}

export function getCurrentAndNextYearHolidays(): Holiday[] {
  const currentYear = new Date().getFullYear()
  return [
    ...getPhilippineHolidays(currentYear),
    ...getPhilippineHolidays(currentYear + 1),
  ]
}
