/**
 * Predefined target table columns (100 per entity).
 * Used for field mapping destination options for Account, Contact, and Opportunity.
 */
export const TARGET_COLUMNS_ACCOUNT: string[] = [
  'Account Name', 'Industry', 'Annual Revenue', 'Website', 'Phone', 'Country', 'Company', 'JobTitle', 'Department', 'EmployeeId',
  'Manager', 'StartDate', 'Salary', 'BirthDate', 'Gender', 'MaritalStatus', 'Nationality', 'TaxId', 'MiddleName', 'FaxNumber',
  'MobileNumber', 'LinkedIn', 'Currency', 'AccountId', 'NumberOfEmployees', 'Ownership', 'Rating', 'AccountType', 'LeadSource', 'Campaign',
  'BillingStreet', 'BillingCity', 'BillingState', 'BillingZip', 'BillingCountry', 'ShippingStreet', 'ShippingCity', 'ShippingState', 'ShippingZip', 'ShippingCountry',
  'YearFounded', 'Description', 'HomePhone', 'OtherPhone', 'MailingStreet', 'MailingCity', 'MailingState', 'MailingZip', 'MailingCountry', 'AlternateEmail',
  'PersonalEmail', 'WorkEmail', 'EmergencyContact', 'EmergencyPhone', 'LifetimeValue', 'LastPurchaseDate', 'FirstPurchaseDate', 'TotalOrders', 'AverageOrderValue', 'LastActivityDate',
  'CreatedDate', 'ModifiedDate', 'CreatedBy', 'ModifiedBy', 'IsActive', 'IsVerified', 'OptInEmail', 'OptInSms', 'LeadScore', 'CustomerTier',
  'Region', 'Territory', 'SalesRep', 'Quota', 'Commission', 'PaymentTerms', 'CreditLimit', 'Balance', 'LastPaymentDate', 'ProductInterest',
  'Quantity', 'UnitPrice', 'Discount', 'TaxAmount', 'ShippingCost', 'TotalAmount', 'OrderStatus', 'DeliveryMethod', 'TrackingNumber', 'PreferredContact',
  'TimeZone', 'Language', 'Segment', 'Notes', 'Tags', 'Source', 'Type', 'Status', 'Priority', 'CustomField100'
];

export const TARGET_COLUMNS_CONTACT: string[] = [
  'First Name', 'Last Name', 'Email', 'Phone', 'Title', 'Department', 'Account', 'Company', 'JobTitle', 'EmployeeId',
  'Manager', 'StartDate', 'Salary', 'BirthDate', 'Gender', 'MaritalStatus', 'Nationality', 'TaxId', 'MiddleName', 'Suffix',
  'FaxNumber', 'MobileNumber', 'Website', 'LinkedIn', 'Currency', 'Country', 'StreetAddress', 'CityName', 'StateName', 'ZipCode',
  'BillingStreet', 'BillingCity', 'BillingState', 'BillingZip', 'BillingCountry', 'ShippingStreet', 'ShippingCity', 'ShippingState', 'ShippingZip', 'ShippingCountry',
  'YearFounded', 'Description', 'HomePhone', 'OtherPhone', 'MailingStreet', 'MailingCity', 'MailingState', 'MailingZip', 'MailingCountry', 'AlternateEmail',
  'PersonalEmail', 'WorkEmail', 'EmergencyContact', 'EmergencyPhone', 'LifetimeValue', 'LastPurchaseDate', 'FirstPurchaseDate', 'TotalOrders', 'AverageOrderValue', 'LastActivityDate',
  'CreatedDate', 'ModifiedDate', 'CreatedBy', 'ModifiedBy', 'IsActive', 'IsVerified', 'OptInEmail', 'OptInSms', 'LeadScore', 'CustomerTier',
  'Region', 'Territory', 'SalesRep', 'Quota', 'Commission', 'PaymentTerms', 'CreditLimit', 'Balance', 'LastPaymentDate', 'ProductInterest',
  'Quantity', 'UnitPrice', 'Discount', 'TaxAmount', 'ShippingCost', 'TotalAmount', 'OrderStatus', 'DeliveryMethod', 'TrackingNumber', 'PreferredContact',
  'TimeZone', 'Language', 'Segment', 'Notes', 'Tags', 'Source', 'Type', 'Status', 'Priority', 'CustomField100'
];

export const TARGET_COLUMNS_OPPORTUNITY: string[] = [
  'Opportunity Name', 'Amount', 'Stage', 'Close Date', 'Probability', 'Account', 'Owner', 'Company', 'Contact', 'LeadSource',
  'Campaign', 'Type', 'Next Step', 'Description', 'ForecastCategory', 'Pricebook2Id', 'ContractId', 'Manager', 'StartDate', 'EndDate',
  'BillingStreet', 'BillingCity', 'BillingState', 'BillingZip', 'BillingCountry', 'ShippingStreet', 'ShippingCity', 'ShippingState', 'ShippingZip', 'ShippingCountry',
  'AnnualRevenue', 'NumberOfEmployees', 'Industry', 'Rating', 'Website', 'Phone', 'FaxNumber', 'AccountId', 'ContactId', 'OwnerId',
  'CreatedDate', 'ModifiedDate', 'CreatedBy', 'ModifiedBy', 'IsClosed', 'IsWon', 'FiscalQuarter', 'FiscalYear', 'Discount', 'TotalAmount',
  'Quantity', 'UnitPrice', 'TaxAmount', 'ShippingCost', 'OrderStatus', 'DeliveryMethod', 'TrackingNumber', 'PreferredContact', 'TimeZone', 'Language',
  'Segment', 'Notes', 'Tags', 'Source', 'Status', 'Priority', 'Region', 'Territory', 'SalesRep', 'Quota', 'Commission',
  'PaymentTerms', 'CreditLimit', 'Balance', 'LastPaymentDate', 'LifetimeValue', 'LastPurchaseDate', 'FirstPurchaseDate', 'TotalOrders', 'AverageOrderValue', 'LastActivityDate',
  'IsActive', 'IsVerified', 'OptInEmail', 'OptInSms', 'LeadScore', 'CustomerTier', 'ProductInterest', 'PreferredContact2', 'TimeZone2', 'Language2',
  'Segment2', 'Notes2', 'Tags2', 'Source2', 'Type2', 'Status2', 'Priority2', 'CustomField99', 'CustomField100'
];

const TARGET_COLUMNS_BY_ENTITY: { [key: string]: string[] } = {
  Account: TARGET_COLUMNS_ACCOUNT,
  Contact: TARGET_COLUMNS_CONTACT,
  Opportunity: TARGET_COLUMNS_OPPORTUNITY,
};

/** Get predefined target columns for an entity (100 columns per table). */
export function getTargetColumnsForEntity(entity: string): string[] {
  return TARGET_COLUMNS_BY_ENTITY[entity] ?? TARGET_COLUMNS_CONTACT;
}
