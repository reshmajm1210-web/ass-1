/**
 * Static reference data (code lists) for the shipping bill domain.
 *
 * This module is the ONLY place these lists exist. Components never import
 * it directly — they go through `reference-data-service.ts`, which serves the
 * lists asynchronously so a real HTTP endpoint can replace them later.
 *
 * Sources (kept from the starter):
 * - document codes: ICEGATE e-Sanchit document type codes
 * - quantity codes: ewaybill GST master codes (duplicate MTR entry removed)
 * - scheme codes:   https://www.icegate.gov.in/Webappl/SCHEME_ENQ
 * - state codes:    https://docs.ewaybillgst.gov.in/apidocs/state-code.html
 * - trade codes:    https://www.icegate.gov.in/Webappl/Ftp
 */
import type { Option, PortOption, SchemeCodeOption } from '../../domain/shipping-bill/types.ts'

/* ------------------------------------------------------------------ */
/* Ports & countries                                                   */
/* ------------------------------------------------------------------ */

/** Indian ports usable as port of loading. */
export const loadingPorts: PortOption[] = [
  { code: 'INNSA1', name: 'Nhava Sheva', countryCode: 'IN' },
  { code: 'INMUN1', name: 'Mundra', countryCode: 'IN' },
  { code: 'INMAA1', name: 'Chennai', countryCode: 'IN' },
  { code: 'INBOM4', name: 'Mumbai Air Cargo', countryCode: 'IN' }
]

/** Foreign ports usable as final destination / discharge. */
export const destinationPorts: PortOption[] = [
  { code: 'USMSY', name: 'New Orleans', countryCode: 'US' },
  { code: 'USLAX', name: 'Los Angeles', countryCode: 'US' },
  { code: 'DEHAM', name: 'Hamburg', countryCode: 'DE' },
  { code: 'AEJEA', name: 'Jebel Ali', countryCode: 'AE' },
  { code: 'SGSIN', name: 'Singapore', countryCode: 'SG' }
]

/** Every known port (loading + destination) — used for country resolution. */
export const allPorts: PortOption[] = [...loadingPorts, ...destinationPorts]

export const countries: Option[] = [
  { value: 'IN', label: 'India' },
  { value: 'US', label: 'United States' },
  { value: 'DE', label: 'Germany' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SG', label: 'Singapore' },
  { value: 'GB', label: 'United Kingdom' }
]

/* ------------------------------------------------------------------ */
/* Bill-level code lists                                               */
/* ------------------------------------------------------------------ */

export const currencyOptions: Option[] = ['USD', 'EUR', 'INR', 'AED', 'GBP', 'SGD'].map((value) => ({
  value,
  label: value
}))

export const sealTypes: Option[] = [
  { value: 'S', label: 'S - Self sealed' },
  { value: 'A', label: 'A - Agency / Customs sealed' },
  { value: 'W', label: 'W - Warehouse / Port sealed' }
]

export const contractTypes: Option[] = [
  { value: 'FOB', label: 'FOB (Free on Board)' },
  { value: 'CF', label: 'CF (Cost + Freight)' },
  { value: 'CIF', label: 'CIF (Cost + Insurance + Freight)' },
  { value: 'CI', label: 'CI - (Cost + Insurance)' }
]

export const weightUnits: Option[] = [
  { value: 'KG', label: 'kg (kilogram)' },
  { value: 'g', label: 'g (gram)' },
  { value: 'MT', label: 'mt (metric ton)' },
  { value: 'lb', label: 'lb (pound)' }
]

export const paymentTypes: Option[] = [
  { value: 'DP', label: 'DP (Direct payment)' },
  { value: 'AP', label: 'AP (Advance payment)' },
  { value: 'LC', label: 'LC (Letter of credit)' },
  { value: 'DA', label: 'DA (Delivery against acceptance)' },
  { value: 'NA', label: 'NA (Not applicable)' }
]

export const priceInclusionTypes: Option[] = [
  { value: 'B', label: 'Freight and insurance - B' },
  { value: 'F', label: 'Freight only - F' },
  { value: 'I', label: 'Insurance only - I' },
  { value: 'N', label: 'Neither - N' }
]

export const cargoOptions: Option[] = [
  { value: 'P', label: 'Packaged cargo - P' },
  { value: 'C', label: 'Containerized - C' },
  { value: 'CP', label: 'Containerized packages - CP' },
  { value: 'LB', label: 'Liquid bulk - LB' },
  { value: 'DB', label: 'Dry bulk - DB' }
]

export const nfeiCategories: Option[] = [
  { value: '01', label: 'Free trade sample' },
  { value: '02', label: 'Diplomatic goods' },
  { value: '03', label: 'Warranty replacement' },
  { value: '07', label: 'Gift parcel' },
  { value: '08', label: 'Other' }
]

export const stateOptions: Option[] = [
  { value: '1', label: 'Jammu and Kashmir - 01' },
  { value: '2', label: 'Himachal Pradesh - 02' },
  { value: '3', label: 'Punjab - 03' },
  { value: '4', label: 'Chandigarh - 04' },
  { value: '5', label: 'Uttarakhand - 05' },
  { value: '6', label: 'Haryana - 06' },
  { value: '7', label: 'Delhi - 07' },
  { value: '8', label: 'Rajasthan - 08' },
  { value: '9', label: 'Uttar Pradesh - 09' },
  { value: '10', label: 'Bihar - 10' },
  { value: '11', label: 'Sikkim - 11' },
  { value: '12', label: 'Arunachal Pradesh - 12' },
  { value: '13', label: 'Nagaland - 13' },
  { value: '14', label: 'Manipur - 14' },
  { value: '15', label: 'Mizoram - 15' },
  { value: '16', label: 'Tripura - 16' },
  { value: '17', label: 'Meghalaya - 17' },
  { value: '18', label: 'Assam - 18' },
  { value: '19', label: 'West Bengal - 19' },
  { value: '20', label: 'Jharkhand - 20' },
  { value: '21', label: 'Orissa - 21' },
  { value: '22', label: 'Chhattisgarh - 22' },
  { value: '23', label: 'Madhya Pradesh - 23' },
  { value: '24', label: 'Gujarat - 24' },
  { value: '26', label: 'Dadra and Nagar Haveli & Daman And Diu - 26' },
  { value: '27', label: 'Maharashtra - 27' },
  { value: '29', label: 'Karnataka - 29' },
  { value: '30', label: 'Goa - 30' },
  { value: '31', label: 'Lakshadweep - 31' },
  { value: '32', label: 'Kerala - 32' },
  { value: '33', label: 'Tamil Nadu - 33' },
  { value: '34', label: 'Puducherry - 34' },
  { value: '35', label: 'Andaman and Nicobar - 35' },
  { value: '36', label: 'Telangana - 36' },
  { value: '37', label: 'Andhra Pradesh - 37' },
  { value: '38', label: 'Ladakh - 38' }
]

/* ------------------------------------------------------------------ */
/* Container & item code lists                                         */
/* ------------------------------------------------------------------ */

export const containerSizes: Option[] = [
  { value: '20', label: '20 ft' },
  { value: '40', label: '40 ft' },
  { value: '45', label: '45 ft' }
]

export const containerSealTypes: Option[] = [
  { value: '1', label: 'BTSL - Bottle Seal' },
  { value: '2', label: 'ESEAL - Electronic Seal' },
  { value: '3', label: 'RFID - Radio Frequency Identifier' }
]

export const igstPaymentOptions: Option[] = [
  { value: 'NA', label: 'Not applicable' },
  { value: 'LUT', label: 'Under LUT / bond' },
  { value: 'P', label: 'Against payment' }
]

export const accessoryStatusOptions: Option[] = [
  { value: '0', label: 'No accessory' },
  { value: '1', label: 'Included free of cost' },
  { value: '2', label: 'Entered separately' }
]

export const goodsSourceOptions: Option[] = [
  { value: 'I', label: 'Imported' },
  { value: 'D', label: 'Indigenous' }
]

export const fileTypeOptions: Option[] = [{ value: 'pdf', label: 'PDF' }]

export const exporterClassOptions: Option[] = [
  { value: 'F', label: 'Manufacturer' },
  { value: 'R', label: 'Merchant' },
  { value: 'C', label: 'Merchant courier' },
  { value: 'D', label: 'Manufacturer courier' }
]

export const exporterTypeOptions: Option[] = [
  { value: 'P', label: 'Private' },
  { value: 'G', label: 'Government' },
  { value: 'W', label: 'Warehouse' }
]

/* ------------------------------------------------------------------ */
/* Marks & numbers (per exporter)                                      */
/* ------------------------------------------------------------------ */

/**
 * Dummy data source from the starter. Replace the service function's
 * implementation with a real endpoint when one exists; callers only depend
 * on the async interface. Exporters without an entry get an empty list,
 * which the form renders as a disabled select (empty state).
 */
export const marksByExporter: Record<string, Option[]> = {
  '1000': [
    { value: 'AARAV TEXTILES / MADE IN INDIA', label: 'AARAV TEXTILES / MADE IN INDIA' },
    { value: 'ATPL / LOT NO. ______', label: 'ATPL / LOT NO. ______' }
  ],
  '1002': [
    { value: 'BLUE HARBOR EXPORTS / INDIA', label: 'BLUE HARBOR EXPORTS / INDIA' },
    { value: 'BHE / SHIPPING MARKS AS PER INVOICE', label: 'BHE / SHIPPING MARKS AS PER INVOICE' }
  ]
}

/* ------------------------------------------------------------------ */
/* Quantity codes (UQC)                                                */
/* ------------------------------------------------------------------ */

export const quantityCodes: Option[] = [
  { value: 'AMP', label: 'AMP - Ampules' },
  { value: 'BAG', label: 'BAG - Bags' },
  { value: 'BAL', label: 'BAL - Bale' },
  { value: 'BDL', label: 'BDL - Bundles' },
  { value: 'BKL', label: 'BKL - Buckles' },
  { value: 'BOU', label: 'BOU - Billion of Units' },
  { value: 'BOX', label: 'BOX - Box' },
  { value: 'BTL', label: 'BTL - Bottles' },
  { value: 'BUN', label: 'BUN - Bunches' },
  { value: 'CAN', label: 'CAN - Cans' },
  { value: 'CBM', label: 'CBM - Cubic Meters' },
  { value: 'CCM', label: 'CCM - Cubic Centimeters' },
  { value: 'CMS', label: 'CMS - Centimeter' },
  { value: 'CRT', label: 'CRT - CARAT' },
  { value: 'CTN', label: 'CTN - Cartons' },
  { value: 'DOZ', label: 'DOZ - Dozens' },
  { value: 'DRM', label: 'DRM - Drums' },
  { value: 'FTS', label: 'FTS - Feet' },
  { value: 'GGR', label: 'GGR - GREAT GROSS' },
  { value: 'GGK', label: 'GGK - Great Gross' },
  { value: 'GMS', label: 'GMS - Grams' },
  { value: 'GRS', label: 'GRS - Gross' },
  { value: 'GYD', label: 'GYD - Gross Yards' },
  { value: 'KGA', label: 'KGA - Kilogram Activity' },
  { value: 'KGB', label: 'KGB - Kilogram Base' },
  { value: 'KGS', label: 'KGS - Kilograms' },
  { value: 'KIT', label: 'KIT - Kits' },
  { value: 'KLR', label: 'KLR - Kilolitre' },
  { value: 'KME', label: 'KME - Kilometre' },
  { value: 'LBS', label: 'LBS - Pounds' },
  { value: 'LTR', label: 'LTR - Litres' },
  { value: 'MGS', label: 'MGS - Miligrams' },
  { value: 'MKU', label: 'MKU - Million Keasergen' },
  { value: 'MLT', label: 'MLT - Mililitre' },
  { value: 'MOU', label: 'MOU - Millions Of Unit' },
  { value: 'MTR', label: 'MTR - Meters' },
  { value: 'MUS', label: 'MUS - Million Units' },
  { value: 'NOS', label: 'NOS - Numbers' },
  { value: 'PAC', label: 'PAC - Packs' },
  { value: 'PCS', label: 'PCS - Pieces' },
  { value: 'PRS', label: 'PRS - Pairs' },
  { value: 'QTL', label: 'QTL - Quintal' },
  { value: 'ROL', label: 'ROL - Rolls' },
  { value: 'SET', label: 'SET - Sets' },
  { value: 'SQF', label: 'SQF - Square Feet' },
  { value: 'SQM', label: 'SQM - Square Meters' },
  { value: 'SQY', label: 'SQY - Square Yards' },
  { value: 'TBS', label: 'TBS - Tablets' },
  { value: 'TGM', label: 'TGM - Ten Gross' },
  { value: 'THD', label: 'THD - Thousands' },
  { value: 'TON', label: 'TON - Tonnes' },
  { value: 'TUB', label: 'TUB - Tubes' },
  { value: 'UGS', label: 'UGS - Us Gallons' },
  { value: 'UNT', label: 'UNT - Units' },
  { value: 'VLS', label: 'VLS - Vials' },
  { value: 'YDS', label: 'YDS - Yards' }
]

/* ------------------------------------------------------------------ */
/* Scheme codes (with incentive flags driving conditional fields)      */
/* ------------------------------------------------------------------ */

export const schemeCodes: SchemeCodeOption[] = [
  // Most frequently used schemes first (order kept from the starter).
  { value: '00', label: '00 - Free SB Involving Remittance Of Foreign Exchange', drawback: false, rodtep: false, rosctl: false },
  { value: '03', label: '03 - Advance License', drawback: false, rodtep: false, rosctl: false },
  { value: '12', label: '12 - Zero Duty EPCG Scheme', drawback: false, rodtep: false, rosctl: false },
  { value: '19', label: '19 - Drawback', drawback: true, rodtep: false, rosctl: false },
  { value: '21', label: '21 - EOU / EPZ / SEZ / EHTP / STP', drawback: false, rodtep: false, rosctl: false },
  { value: '43', label: '43 - Drawback And Zero Duty EPCG', drawback: true, rodtep: false, rosctl: false },
  { value: '60', label: '60 - Drawback and ROSCTL', drawback: true, rodtep: false, rosctl: true },
  { value: '61', label: '61 - EPCG, Drawback and ROSCTL', drawback: true, rodtep: false, rosctl: true },
  { value: '64', label: '64 - Drawback, special DEEC(4.04A) and ROSCTL', drawback: true, rodtep: false, rosctl: true },
  { value: '99', label: '99 - NFEI', drawback: false, rodtep: false, rosctl: false },

  // Rest of the codes ordered by value.
  { value: '01', label: '01 - Advance License With Actual User Condition', drawback: false, rodtep: false, rosctl: false },
  { value: '02', label: '02 - Advance License For Intermediate Supplies', drawback: false, rodtep: false, rosctl: false },
  { value: '04', label: '04 - Advance Release Order', drawback: false, rodtep: false, rosctl: false },
  { value: '05', label: '05 - Advance License For Deemed Exports', drawback: false, rodtep: false, rosctl: false },
  { value: '06', label: '06 - DEPB Post Export', drawback: false, rodtep: false, rosctl: false },
  { value: '07', label: '07 - DEPB-Pre Export', drawback: false, rodtep: false, rosctl: false },
  { value: '08', label: '08 - Replenishment Licence', drawback: false, rodtep: false, rosctl: false },
  { value: '09', label: '09 - Diamond Imprest Licence', drawback: false, rodtep: false, rosctl: false },
  { value: '10', label: '10 - Bulk License', drawback: false, rodtep: false, rosctl: false },
  { value: '11', label: '11 - Concessional Duty EPCG Scheme', drawback: false, rodtep: false, rosctl: false },
  { value: '13', label: '13 - CCP', drawback: false, rodtep: false, rosctl: false },
  { value: '14', label: '14 - Import License For Restricted Items Of Imports', drawback: false, rodtep: false, rosctl: false },
  { value: '15', label: '15 - Special Import License', drawback: false, rodtep: false, rosctl: false },
  { value: '16', label: '16 - Export License', drawback: false, rodtep: false, rosctl: false },
  { value: '17', label: '17 - Advance Licence for annual requirement', drawback: false, rodtep: false, rosctl: false },
  { value: '20', label: '20 - Jobbing (JBG)', drawback: false, rodtep: false, rosctl: false },
  { value: '22', label: '22 - Duty Free Credit Entitlement Certificate', drawback: false, rodtep: false, rosctl: false },
  { value: '23', label: '23 - Target Plus Scheme', drawback: false, rodtep: false, rosctl: false },
  { value: '24', label: '24 - Vishesh Krishi Upaj Yojana (VKUY)', drawback: false, rodtep: false, rosctl: false },
  { value: '25', label: '25 - DFCE for Status holder', drawback: false, rodtep: false, rosctl: false },
  { value: '26', label: '26 - Duty Free Import Authorization', drawback: false, rodtep: false, rosctl: false },
  { value: '27', label: '27 - Focus Market Scheme', drawback: false, rodtep: false, rosctl: false },
  { value: '28', label: '28 - Focus Product Scheme', drawback: false, rodtep: false, rosctl: false },
  { value: '29', label: '29 - High Tech Products Export Promotion Scheme', drawback: false, rodtep: false, rosctl: false },
  { value: '30', label: '30 - EPCG Duty Based', drawback: false, rodtep: false, rosctl: false },
  { value: '31', label: '31 - Status Holder Incentive Scheme', drawback: false, rodtep: false, rosctl: false },
  { value: '32', label: '32 - Tariff Quota', drawback: false, rodtep: false, rosctl: false },
  { value: '33', label: '33 - Post Export EPCG', drawback: false, rodtep: false, rosctl: false },
  { value: '34', label: '34 - Post Export EPCG - Duty', drawback: false, rodtep: false, rosctl: false },
  { value: '35', label: '35 - Incremental Incentivisation Scheme', drawback: false, rodtep: false, rosctl: false },
  { value: '39', label: '39 - Rebate of State and Central Taxes Levies', drawback: false, rodtep: false, rosctl: false },
  { value: '40', label: '40 - DBK and Advance Licence for annual requirement', drawback: true, rodtep: false, rosctl: false },
  { value: '41', label: '41 - Drawback And Advance License', drawback: true, rodtep: false, rosctl: false },
  { value: '44', label: '44 - Drawback And Concessional Duty EPCG', drawback: true, rodtep: false, rosctl: false },
  { value: '45', label: '45 - Drawback And Pre Export DEPB', drawback: true, rodtep: false, rosctl: false },
  { value: '46', label: '46 - Drawback And Post Export DEPB', drawback: true, rodtep: false, rosctl: false },
  { value: '47', label: '47 - Drawback And JBG', drawback: true, rodtep: false, rosctl: false },
  { value: '48', label: '48 - Drawback And Diamond Imprest Licence', drawback: true, rodtep: false, rosctl: false },
  { value: '49', label: '49 - Drawback And EOU/EPZ/SEZ', drawback: true, rodtep: false, rosctl: false },
  { value: '50', label: '50 - EPCG And Advance Licence', drawback: false, rodtep: false, rosctl: false },
  { value: '52', label: '52 - EPCG and JBG', drawback: false, rodtep: false, rosctl: false },
  { value: '53', label: '53 - EPCG And Diamond Imprest Licence', drawback: false, rodtep: false, rosctl: false },
  { value: '54', label: '54 - EPCG And Replenishment Licence', drawback: false, rodtep: false, rosctl: false },
  { value: '55', label: '55 - EPCG and DEPB(Post Exports)', drawback: false, rodtep: false, rosctl: false },
  { value: '56', label: '56 - EPCG and Advance Licence for annual requirement', drawback: false, rodtep: false, rosctl: false },
  { value: '59', label: '59 - EPCG and DFIA', drawback: false, rodtep: false, rosctl: false },
  { value: '62', label: '62 - Drawback and special DEEC(4.04A)', drawback: true, rodtep: false, rosctl: false },
  { value: '63', label: '63 - EPCG, Drawback and special DEEC(4.04A)', drawback: true, rodtep: false, rosctl: false },
  { value: '65', label: '65 - EPCG, Drawback, special DEEC(4.04A) and ROSCTL', drawback: true, rodtep: false, rosctl: true },
  { value: '71', label: '71 - EPCG, Drawback And DEEC', drawback: true, rodtep: false, rosctl: false },
  { value: '73', label: '73 - EPCG, DRAWBACK And Jobbing', drawback: true, rodtep: false, rosctl: false },
  { value: '74', label: '74 - EPCG Drawback And Diamond Imprest Licence', drawback: true, rodtep: false, rosctl: false },
  { value: '75', label: '75 - EPCG Drawback And DEPB Post Export', drawback: true, rodtep: false, rosctl: false },
  { value: '76', label: '76 - Epcg, Drawback And Depb (Pre-export)', drawback: true, rodtep: false, rosctl: false },
  { value: '79', label: '79 - EPCG, Drawback and DFIA', drawback: true, rodtep: false, rosctl: false },
  { value: '80', label: '80 - EPCG, Drawback and Advance Licence for annual requirement', drawback: true, rodtep: false, rosctl: false },
  { value: '81', label: '81 - DFIA and Drawback', drawback: true, rodtep: false, rosctl: false },
  { value: '98', label: '98 - Free Shipping Bill involving Indian Currency', drawback: false, rodtep: false, rosctl: false },
  { value: 'PB', label: 'PB - Prohibited Imports', drawback: false, rodtep: false, rosctl: false },
  { value: 'PI', label: 'PI - Project Import', drawback: false, rodtep: false, rosctl: false },
  { value: 'RD', label: 'RD - RoDTEP Scheme', drawback: false, rodtep: true, rosctl: false },
  { value: 'RS', label: 'RS - RoSCTL Scheme', drawback: false, rodtep: false, rosctl: true }
]

/** `true` when the scheme enables any drawback-style input row. */
export function schemeShowsDrawback(scheme: SchemeCodeOption | undefined): boolean {
  return Boolean(scheme && (scheme.drawback || scheme.rodtep || scheme.rosctl))
}

/* ------------------------------------------------------------------ */
/* Trade agreement codes                                               */
/* ------------------------------------------------------------------ */

export const tradeAgreementOptions: Option[] = [
  { value: 'NCPTI', label: 'NCPTI - Preferential Trade Benefit not claimed at Importing Country' },
  { value: 'FTA0SL', label: 'FTA0SL - India - Sri Lanka FTA' },
  { value: 'FTA0SA', label: 'FTA0SA - Agreement on SAFTA' },
  { value: 'FTA0NL', label: 'FTA0NL - India Nepal Treaty of Trade' },
  { value: 'FTA0BT', label: 'FTA0BT - India - Bhutan Agreement on Trade Commerce and Transit' },
  { value: 'FTA0TH', label: 'FTA0TH - India - Thailand FTA - Early Harvest Scheme (EHS)' },
  { value: 'CEPASG', label: 'CEPASG - India - Singapore CECA' },
  { value: 'CEPASEA', label: 'CEPASEA - India - ASEAN- CECA - Trade in Goods, Services and Investment Agreement' },
  { value: 'CEPAKR', label: 'CEPAKR - India - South Korea CEPA' },
  { value: 'CEPAJP', label: 'CEPAJP - India - Japan CEPA' },
  { value: 'CECAMY', label: 'CECAMY - India - Malaysia CECA' },
  { value: 'PTAAPTA', label: 'PTAAPTA - Asia Pacific Trade Agreement (APTA)' },
  { value: 'GSTP', label: 'GSTP - Global System of Trade Preferences (GSTP)' },
  { value: 'PTA0SA', label: 'PTA0SA - SAARC Preferential Trading Agreement (SAPTA)' },
  { value: 'PTA0AF', label: 'PTA0AF - India - Afghanistan' },
  { value: 'PTA0MER', label: 'PTA0MER - India - MERCOSUR' },
  { value: 'PTA0CL', label: 'PTA0CL - India - Chile' },
  { value: 'ECTAAU', label: 'ECTAAU - India-AUS ECTA' },
  { value: 'CEPAOM', label: 'CEPAOM - India-OMAN CEPA' },
  { value: 'CEPAAE', label: 'CEPAAE - India-UAE CEPA' },
  { value: 'CETAUK', label: 'CETAUK - India-UK CETA' }
]

/* ------------------------------------------------------------------ */
/* e-Sanchit document type codes                                       */
/* ------------------------------------------------------------------ */

export const documentCodes: Option[] = [
  { value: '011000', label: '011000 - Federal Label approval' },
  { value: '2670PQ', label: '2670PQ - Fumigation Certificate' },
  { value: '856000', label: '856000 - Inspection certificate' },
  { value: '955000', label: '955000 - ATA carnet' },
  { value: '740000', label: '740000 - Air Waybill AWB' },
  { value: '430000', label: "430000 - Banker's guarantee" },
  { value: '0030DC', label: '0030DC - Batch Release certificate' },
  { value: '705000', label: '705000 - Bill of lading BL' },
  { value: '001003', label: '001003 - Blood Analysis Report' },
  { value: '165000', label: '165000 - Bond' },
  { value: '0010FS', label: '0010FS - Certificate of analysis & food Supplement' },
  { value: '001000', label: '001000 - Certificate of analysis COA' },
  { value: '0010DC', label: '0010DC - Certificate of analysis - Drug' },
  { value: '648000', label: '648000 - Certificate of compliance with standards of the world organisation' },
  { value: '002000', label: '002000 - Certificate of compormity' },
  { value: '861000', label: '861000 - Certificate of origin COO' },
  { value: '865000', label: '865000 - Certificate of Origin form GSP' },
  { value: '003000', label: '003000 - Certificate of quality ISO' },
  { value: '798000', label: '798000 - Certificate of registry' },
  { value: '6490DC', label: '6490DC - Certified copy of the licensed premises' },
  { value: '380000', label: '380000 - Commercial invoice TAX INV' },
  { value: '331000', label: '331000 - Commercial invoice which includes a packing list INV + PKL' },
  { value: '6490HZ', label: '6490HZ - Consent to operate / Registration' },
  { value: '870000', label: '870000 - Consular invoice' },
  { value: '7880FS', label: '7880FS - Container stuffing report' },
  { value: '788000', label: '788000 - Container manifest (unit packing list)' },
  { value: '315000', label: '315000 - Contract' },
  { value: '250000', label: '250000 - Crew list declaration' },
  { value: '744000', label: '744000 - Crew S effects declaration' },
  { value: '935000', label: '935000 - Customs invoice EXP. INV' },
  { value: '890000', label: '890000 - Dangerous goods declaration' },
  { value: '298000', label: '298000 - Dangerous goods list' },
  { value: '465000', label: '465000 - Documentary credit' },
  { value: '708000', label: '708000 - Empty Container bill' },
  { value: '811000', label: '811000 - Export licence' },
  { value: '911001', label: '911001 - FSSAI Import License' },
  { value: '637000', label: '637000 - Food grade certificate' },
  { value: '6570FS', label: '6570FS - Food grade certificate' },
  { value: '627000', label: '627000 - Free Sale Certification in the country of origin' },
  { value: '636000', label: '636000 - Health Certificate' },
  { value: '6360AQ', label: '6360AQ - Health Certificate' },
  { value: '714000', label: '714000 - House Bill of lading HBL' },
  { value: '703000', label: '703000 - House waybill' },
  { value: '911000', label: '911000 - Import licence' },
  { value: '101001', label: '101001 - Importer exporter certificate' },
  { value: '651001', label: '651001 - Industrial license' },
  { value: '711000', label: '711000 - Inland waterway bill of lading' },
  { value: '293000', label: '293000 - Inspection report' },
  { value: '520000', label: '520000 - Insurance certificate' },
  { value: '001002', label: '001002 - Lab analysis report' },
  { value: '651000', label: '651000 - Manufacturing license' },
  { value: '797000', label: '797000 - Maritime declaration of health' },
  { value: '741000', label: '741000 - Master air waybill MAWB' },
  { value: '704000', label: '704000 - Master bill of lading MBL' },
  { value: '713000', label: '713000 - Mate s receipt' },
  { value: 'XXX001', label: 'XXX001 - Narcotics certificate' },
  { value: '271000', label: '271000 - Packing list PKL' },
  { value: '745000', label: '745000 - Passenger list' },
  { value: '8520PQ', label: '8520PQ - Phyosanitary import permit' },
  { value: '6570PQ', label: '6570PQ - Phytosanitary Re export certificate' },
  { value: '8510FS', label: '8510FS - Phytosanitary certificate' },
  { value: '856001', label: '856001 - Pre shipment inspection certificate' },
  { value: '864000', label: '864000 - Preference certificate of origin' },
  { value: '005000', label: '005000 - Price/Sales Catelogue' },
  { value: '003001', label: '003001 - Product approval DFIA' },
  { value: '006000', label: '006000 - Product specification report' },
  { value: '649000', label: '649000 - Production facility license' },
  { value: '325000', label: '325000 - Proforma Invoice PRO. INV' },
  { value: 'XXX000', label: 'XXX000 - Protocols approval letter' },
  { value: '105000', label: '105000 - Purchase order PO' },
  { value: '101002', label: '101002 - RCMC' },
  { value: 'XXX003', label: 'XXX003 - Radio activity report' },
  { value: '720000', label: '720000 - Rail consignment note ( generic term)' },
  { value: '1010DC', label: '1010DC - Registration Certificate' },
  { value: '101000', label: '101000 - Registration Document' },
  { value: 'XXX0FS', label: 'XXX0FS - Rejection Certificate' },
  { value: '730000', label: '730000 - Road Consignment Note' },
  { value: '0530HZ', label: '0530HZ - Safety and Hazard Data Sheet' },
  { value: '8520AQ', label: '8520AQ - Saniary Import Permit' },
  { value: '852000', label: '852000 - Sanitary certificate' },
  { value: '710000', label: '710000 - Sea Waybill' },
  { value: '799000', label: "799000 - Ship's Stores declaration" },
  { value: '0110FS', label: '0110FS - Specimen copy of label' },
  { value: 'XXX002', label: 'XXX002 - Stuffing List' },
  { value: '709000', label: '709000 - Tanker bill of lading' },
  { value: '006001', label: '006001 - Technical writeup/ Literature' },
  { value: '004001', label: '004001 - Test certificate' },
  { value: '004000', label: '004000 - Test Report' },
  { value: '0380AQ', label: '0380AQ - Vaccination certificate' },
  { value: '934000', label: '934000 - Value Declaration (GATT valuation declaration)' },
  { value: '853000', label: '853000 - Veterinary Certificate' },
  { value: '629000', label: '629000 - Veterinary quarantine Certificate AQCS' },
  { value: '700000', label: '700000 - Waybill' }
]
