/**
 * The save boundary: turns editable form values (all strings, references by
 * id) into the snake_case payload a Shipping Bill API expects.
 *
 * The starter had TWO overlapping payload mappers (`toShippingBillPayload` in
 * model.ts and `toHttpShippingBillPayload` in the service). This single mapper
 * replaces both — one place to change when the real API contract lands.
 */
import { isBlank, parseNumberOrZero, parseOptionalNumber, portCountry } from './calculations.ts'
import type { PortOption, ShippingBillFormValues } from './types.ts'

function optionalText(value?: string): string | undefined {
  return isBlank(value) ? undefined : String(value).trim()
}

export function toShippingBillPayload(values: ShippingBillFormValues, knownPorts: PortOption[]) {
  const dischargePort = optionalText(values.dischargePort) ?? values.finalDestinationPort

  return {
    shipping_bill: {
      job_number: parseOptionalNumber(values.jobNumber),
      job_date: values.jobDate,
      exporter: Number(values.exporterId),
      exporter_branch: Number(values.exporterBranchId),
      consignee: Number(values.consigneeId),
      consignee_address: Number(values.consigneeBranchId),
      loading_port: values.loadingPort,
      loading_country_code: portCountry(values.loadingPort, knownPorts),
      final_destination_port: values.finalDestinationPort,
      final_destination_country_code: portCountry(values.finalDestinationPort, knownPorts),
      discharge_port: dischargePort,
      discharge_country_code: portCountry(dischargePort, knownPorts),
      origin_state_code: parseOptionalNumber(values.originStateCode),
      nfei_category: parseOptionalNumber(values.nfeiCategory),
      rbi_waiver_number: optionalText(values.rbiWaiverNumber),
      rbi_waiver_date: optionalText(values.rbiWaiverDate),
      sealtype: optionalText(values.sealType),
      natureofcargo: values.natureOfCargo,
      grossweight: parseOptionalNumber(values.grossWeight),
      netweight: parseOptionalNumber(values.netWeight),
      measurement_unit: values.measurementUnit,
      total_packages: parseOptionalNumber(values.totalPackages),
      marks_and_numbers: optionalText(values.marksAndNumbers),
      loose_packets: parseOptionalNumber(values.loosePackets),
      // Explicit container rows win over the free-text counter.
      number_of_containers:
        values.containers.length > 0
          ? values.containers.length
          : (parseOptionalNumber(values.numberOfContainers) ?? 0),
      mawb_number: optionalText(values.mawbNumber),
      hawb_number: optionalText(values.hawbNumber)
    },
    invoices: values.invoices.map((invoice, index) => ({
      serial_number: index + 1,
      invoicenumber: invoice.invoiceNumber,
      date: invoice.invoiceDate,
      currency: invoice.currency,
      contract_type: invoice.contractType,
      // "Buyer same as consignee" resolves the reference here, not in the UI.
      buyer: Number(invoice.buyerSameAsConsignee ? values.consigneeId : invoice.buyerId),
      buyer_address: Number(invoice.buyerSameAsConsignee ? values.consigneeBranchId : invoice.buyerBranchId),
      third_party: parseOptionalNumber(invoice.thirdPartyId),
      third_party_address: parseOptionalNumber(invoice.thirdPartyBranchId),
      freight_rate: parseOptionalNumber(invoice.freightRate),
      freight_amount: parseOptionalNumber(invoice.freightAmount),
      freight_currency: optionalText(invoice.freightCurrency) ?? invoice.currency,
      insurance_rate: parseOptionalNumber(invoice.insuranceRate),
      insurance_amount: parseOptionalNumber(invoice.insuranceAmount),
      insurance_currency: optionalText(invoice.insuranceCurrency) ?? invoice.currency,
      commission_rate: parseOptionalNumber(invoice.commissionRate),
      commission_amount: parseOptionalNumber(invoice.commissionAmount),
      commission_currency: optionalText(invoice.commissionCurrency) ?? invoice.currency,
      discount_rate: parseOptionalNumber(invoice.discountRate),
      discount_amount: parseOptionalNumber(invoice.discountAmount),
      discount_currency: optionalText(invoice.discountCurrency) ?? invoice.currency,
      other_deductions_rate: parseOptionalNumber(invoice.otherDeductionsRate),
      other_deductions_amount: parseOptionalNumber(invoice.otherDeductionsAmount),
      other_deductions_currency: optionalText(invoice.otherDeductionsCurrency) ?? invoice.currency,
      packing_charges: parseOptionalNumber(invoice.packingCharges),
      freight_insaurance_included: optionalText(invoice.freightInsuranceIncluded),
      contract_number: optionalText(invoice.contractNumber),
      nature_of_payment: optionalText(invoice.natureOfPayment),
      period_of_payment: parseOptionalNumber(invoice.periodOfPayment),
      invoice_total:
        parseOptionalNumber(invoice.invoiceTotal) ??
        invoice.items.reduce((sum, item) => sum + parseNumberOrZero(item.quantity) * parseNumberOrZero(item.unitPrice), 0),
      items: invoice.items.map((item, itemIndex) => ({
        item_serial_number: itemIndex + 1,
        ritc_code: item.ritcCode,
        goods_description_1: item.goodsDescription1,
        goods_description_2: optionalText(item.goodsDescription2),
        goods_description_3: optionalText(item.goodsDescription3),
        accessories_description: optionalText(item.accessoriesDescription),
        scheme_code: optionalText(item.schemeCode),
        quantity: parseNumberOrZero(item.quantity),
        unit_of_measurement: item.unitOfMeasurement,
        unit_price: parseNumberOrZero(item.unitPrice),
        unit_of_rate: optionalText(item.unitOfRate) ?? item.unitOfMeasurement,
        line_total:
          parseOptionalNumber(item.lineTotal) ??
          parseNumberOrZero(item.quantity) * parseNumberOrZero(item.unitPrice),
        present_market_value: parseOptionalNumber(item.presentMarketValue),
        no_of_units: parseOptionalNumber(item.numberOfUnits),
        accessory_status: optionalText(item.accessoryStatus),
        third_party: Boolean(item.thirdPartyItem),
        igst_payment_status: optionalText(item.igstPaymentStatus),
        // Taxable value / IGST amount only apply when IGST was paid ("P").
        taxable_value: item.igstPaymentStatus === 'P' ? parseOptionalNumber(item.taxableValue) : undefined,
        igst_amount: item.igstPaymentStatus === 'P' ? parseOptionalNumber(item.igstAmount) : undefined,
        drawback_serial_number: optionalText(item.drawbackSerialNumber),
        drawback_quantity: parseOptionalNumber(item.drawbackQuantity),
        rodtep: parseOptionalNumber(item.rodtep),
        cess: parseOptionalNumber(item.cess),
        origin_district_code: parseOptionalNumber(item.originDistrictCode),
        trade_agreements_code: optionalText(item.tradeAgreementsCode),
        end_use_of_item: optionalText(item.endUseOfItem),
        total_package: parseOptionalNumber(item.totalPackage),
        reward_item: Boolean(item.rewardItem)
      }))
    })),
    invoice_item_third_parties: values.invoices.flatMap((invoice, invoiceIndex) =>
      invoice.items.flatMap((item, itemIndex) =>
        item.thirdPartyItem && !isBlank(item.itemThirdPartyId)
          ? [
              {
                invoice_serial_number: invoiceIndex + 1,
                item_serial_number: itemIndex + 1,
                third_party: Number(item.itemThirdPartyId),
                third_party_address: parseOptionalNumber(item.itemThirdPartyBranchId)
              }
            ]
          : []
      )
    ),
    ar4_details: values.invoices.flatMap((invoice, invoiceIndex) =>
      invoice.items.flatMap((item, itemIndex) =>
        !isBlank(item.ar4Number)
          ? [
              {
                invoice_serial_number: invoiceIndex + 1,
                item_serial_number: itemIndex + 1,
                ar4_number: item.ar4Number,
                ar4_date: optionalText(item.ar4Date),
                commissionerate: optionalText(item.ar4Commissionerate),
                division: optionalText(item.ar4Division),
                range: optionalText(item.ar4Range),
                remarks: optionalText(item.ar4Remarks)
              }
            ]
          : []
      )
    ),
    container_details: values.containers.map((container) => ({
      container_number: container.containerNumber,
      container_size: parseOptionalNumber(container.containerSize),
      excise_seal_number: optionalText(container.exciseSealNumber),
      seal_date: optionalText(container.sealDate),
      seal_type: optionalText(container.sealType),
      seal_device_id: optionalText(container.sealDeviceId),
      movement_document_type: optionalText(container.movementDocumentType),
      movement_document_number: optionalText(container.movementDocumentNumber)
    })),
    packging_list: values.packingRanges.map((range) => ({
      packing_number_from: parseOptionalNumber(range.packingNumberFrom),
      packing_number_to: parseOptionalNumber(range.packingNumberTo),
      packing_code: optionalText(range.packingCode)
    })),
    supporting_docs: values.documents.map((document, index) => ({
      serial_number: index + 1,
      invoice_serial_number: parseOptionalNumber(document.invoiceSerialNumber),
      item_serial_number: parseOptionalNumber(document.itemSerialNumber),
      document_type_code: document.documentTypeCode,
      document_reference_number: document.documentReferenceNumber,
      image_reference_number: optionalText(document.imageReferenceNumber),
      document_issue_date: document.documentIssueDate
        ? Math.floor(new Date(document.documentIssueDate).getTime() / 86_400_000)
        : undefined,
      document_expiry_date: optionalText(document.documentExpiryDate),
      place_of_issue: optionalText(document.placeOfIssue),
      issuing_party_code: optionalText(document.issuingPartyCode),
      issue_party_name: optionalText(document.issuingPartyName),
      issuing_party_name_addr1: optionalText(document.issuingPartyAddress1),
      issuing_party_name_addr2: optionalText(document.issuingPartyAddress2),
      issuing_party_name_city: optionalText(document.issuingPartyCity),
      issuing_party_name_pin: optionalText(document.issuingPartyPin),
      beneficiary_party_code: optionalText(document.beneficiaryPartyCode),
      beneficiary_party_name: optionalText(document.beneficiaryPartyName),
      beneficiary_party_name_addr1: optionalText(document.beneficiaryPartyAddress1),
      beneficiary_party_name_addr2: optionalText(document.beneficiaryPartyAddress2),
      beneficiary_party_name_city: optionalText(document.beneficiaryPartyCity),
      beneficiary_party_name_pin: optionalText(document.beneficiaryPartyPin),
      file_type: optionalText(document.fileType),
      icegate_id: optionalText(document.icegateId)
    })),
    licenses: values.licenses.map((license) => ({
      registration_number: license.registrationNumber,
      registration_date: optionalText(license.registrationDate),
      invoice_serial_number: parseOptionalNumber(license.invoiceSerialNumber),
      item_serial_number: parseOptionalNumber(license.itemSerialNumber),
      licence_serial_number: parseOptionalNumber(license.licenseSerialNumber),
      item_serial_number_part_e: optionalText(license.itemSerialNumberPartE),
      item_serial_number_part_c: optionalText(license.itemSerialNumberPartC),
      quantity: parseOptionalNumber(license.licenseQuantity),
      export_quantity: parseOptionalNumber(license.licenseExportQuantity),
      indigenous_or_imported: optionalText(license.indigenousOrImported)
    }))
  }
}

export type ShippingBillPayload = ReturnType<typeof toShippingBillPayload>
