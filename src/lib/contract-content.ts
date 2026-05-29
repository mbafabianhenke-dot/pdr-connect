export type ContractSection = {
  h: string;
  p?: string;
  list?: string[];
  p2?: string;
};

export type ContractDoc = {
  title: string;
  badge: string;
  parties: { label: string; operator: string; client: string };
  intro: string;
  sections: ContractSection[];
  printBtn: string;
};

export type ContractSet = {
  tabClient: string;
  tabWorker: string;
  pageTitle: string;
  pageSubtitle: string;
  client: ContractDoc;
  worker: ContractDoc;
};

const CONTRACTS: Record<string, ContractSet> = {
  /* ─────────────── ENGLISH ─────────────── */
  en: {
    pageTitle: 'Platform Contracts',
    pageSubtitle: 'Two contract versions — for Clients and for Technicians/Workers',
    tabClient: '🏢 For Clients / Contractors',
    tabWorker: '🔧 For Technicians / Workers',
    client: {
      title: 'Placement & Service Agreement',
      badge: 'Client / Contractor Version',
      printBtn: 'Print / Save as PDF',
      parties: {
        label: 'Parties',
        operator: 'PDR Connect, operated by Cybratech Solutions Ltd., Efesou 9, 5280 Paralimni, Republic of Cyprus, VAT No. CY60015676H — hereinafter "PDR Connect"',
        client: 'The company, dealership, workshop or individual registered on the platform — hereinafter "Client"',
      },
      intro: 'This Agreement governs the placement services provided by PDR Connect to the Client. By registering on the PDR Connect platform, the Client accepts this Agreement in full.',
      sections: [
        {
          h: '§1 Subject of Agreement',
          p: 'PDR Connect provides professional talent placement services, sourcing and presenting verified PDR technicians and automotive professionals to the Client through the PDR Connect platform (pdrconnect.com).',
        },
        {
          h: '§2 Services Provided by PDR Connect',
          p: 'PDR Connect provides the following services to the Client:',
          list: [
            'Identification and presentation of verified technicians matching the Client\'s requirements',
            'Verification of professional credentials, certifications, and identity documents',
            'Facilitation of secure communication between Client and Technician via the platform',
            'Issuance of all invoices and processing of all payments relating to placed assignments',
            'Ongoing support and assistance throughout the placement process',
          ],
        },
        {
          h: '§3 Platform Service — Client (Currently Free)',
          p: '(1) During the current launch phase, PDR Connect provides its placement and matching services to Clients free of charge. No platform service fee is charged to the Client.\n(2) Clients pay only the agreed technician remuneration as invoiced by PDR Connect. No additional platform surcharge applies.\n(3) Example: If the agreed technician remuneration is €1,000, the Client is invoiced for exactly €1,000.\n(4) PDR Connect reserves the right to introduce a platform service fee for Clients in the future. Clients will be notified with at least 30 days\' advance notice before any such fee takes effect.',
        },
        {
          h: '§4 Payment Terms',
          p: '(1) As a Client/Contractor, you have free and unrestricted access to our platform. However, should any payment obligation arise, the following terms apply:\n(2) All invoices are payable to the Operator of this Platform: "Operated by Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus · VAT: CY60015676H" within 14 days of the invoice date.\n(3) All payments must be transferred exclusively to the Operator of this Platform: "Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus · VAT: CY60015676H". Direct payments from the Client to Technicians outside the platform are strictly prohibited.\n(4) In the event of payment circumvention, PDR Connect reserves the right to immediately suspend the Client\'s account, invoice the outstanding platform fee plus a surcharge, and pursue legal remedies.\n(5) Late payments may be subject to statutory interest under applicable Cypriot law.',
        },
        {
          h: '§5 Client Obligations',
          list: [
            'Provide accurate and complete job requirements when requesting placements',
            'Ensure a safe, legal, and professionally appropriate working environment for all placed technicians',
            'Comply with all applicable labor laws in the country where the technician performs work',
            'Honor all agreed assignment terms including duration, scope, and remuneration',
            'Conduct all communications with Technicians exclusively through the PDR Connect platform',
            'Not establish any direct employment or service relationships with placed technicians outside PDR Connect',
          ],
        },
        {
          h: '§6 Technician Verification & Warranty',
          p: '(1) PDR Connect warrants that all presented technicians have been identity-verified through official documentation.\n(2) PDR Connect does not guarantee specific work outcomes, productivity levels, or results.\n(3) The Client is responsible for assessing the suitability of presented technicians for their specific requirements.',
        },
        {
          h: '§7 Liability',
          p: '(1) PDR Connect\'s liability is limited to the total platform fees paid by the Client for the relevant assignment.\n(2) PDR Connect is not liable for work quality disputes, damages arising from the technician\'s conduct, delays, or consequential losses.\n(3) The Client assumes full liability for compliance with local labor, tax, and employment regulations in the country of work.',
        },
        {
          h: '§8 Confidentiality',
          p: '(1) Both Parties agree to keep all commercial terms, pricing, and assignment details confidential.\n(2) Client data is processed in accordance with PDR Connect\'s Privacy Policy and applicable GDPR regulations.',
        },
        {
          h: '§9 Term and Termination',
          p: '(1) This Agreement is effective from the date of Client registration on the PDR Connect platform.\n(2) Either Party may terminate this Agreement with 14 days\' written notice to info@cybratech-solutions.com.\n(3) Termination does not affect payment obligations or active assignments in progress.\n(4) In cases of serious breach, PDR Connect may terminate this Agreement with immediate effect.',
        },
        {
          h: '§10 Governing Law and Jurisdiction',
          p: 'This Agreement is governed exclusively by the laws of the Republic of Cyprus. Any disputes shall be brought before the competent courts of Nicosia, Cyprus.',
        },
        {
          h: '§11 Amendments',
          p: 'PDR Connect reserves the right to amend these terms with 30 days\' advance notice. Continued use of the platform after the notice period constitutes acceptance of the amended terms.',
        },
      ],
    },
    worker: {
      title: 'Placement & Service Agreement',
      badge: 'Technician / Worker Version',
      printBtn: 'Print / Save as PDF',
      parties: {
        label: 'Parties',
        operator: 'PDR Connect, operated by Cybratech Solutions Ltd., Efesou 9, 5280 Paralimni, Republic of Cyprus, VAT No. CY60015676H — hereinafter "PDR Connect"',
        client: 'The individual professional registered on the platform — hereinafter "Technician"',
      },
      intro: 'This Agreement governs the placement services provided by PDR Connect to the Technician. By registering on the PDR Connect platform, the Technician accepts this Agreement in full.',
      sections: [
        {
          h: '§1 Subject of Agreement',
          p: 'PDR Connect provides professional placement services, matching the Technician with client businesses requiring skilled automotive professionals, through the PDR Connect platform (pdrconnect.com).',
        },
        {
          h: '§2 Services Provided by PDR Connect',
          p: 'PDR Connect provides the following services to the Technician:',
          list: [
            'Active promotion of the Technician\'s profile to client businesses seeking automotive specialists',
            'Facilitation of secure communication between Technician and potential Clients via the platform',
            'Issuance of all invoices to Clients and processing of all payments',
            'Transfer of the Technician\'s earnings (minus the platform service fee) upon receipt of Client payment',
            'Support and assistance throughout the placement process',
          ],
        },
        {
          h: '§3 Platform Service Fee — Technician',
          p: '(1) PDR Connect retains a platform service fee of 10% of the total agreed assignment value as a placement and administration fee.\n(2) This fee is deducted from the agreed assignment value before the remainder is transferred to the Technician.\n(3) Example: For an assignment with an agreed value of €1,000, PDR Connect retains €100 (10%), and the Technician receives €900.\n(4) The platform fee covers: profile marketing and visibility, client matching, secure communication, contract and invoicing administration, and payment processing.\n(5) PDR Connect reserves the right to adjust the platform fee with 30 days\' advance notice.',
        },
        {
          h: '§4 Payment Terms for Technicians / Workers',
          p: '(1) PDR Connect will transfer the Technician\'s/Worker\'s earnings within 7 business days after receiving the Invoice issued by the Technician/Worker AND after PDR Connect has reviewed and approved said Invoice.\n(2) Technicians/Workers shall only issue an Invoice to PDR Connect (Cybratech Solutions Ltd.) after being formally notified by PDR Connect that the full payment from the Client has been received by the Platform. Invoices issued prior to such notification are not valid and will not be processed.\n(3) The Technician shall not request, accept, or facilitate any direct payments from Clients that bypass the PDR Connect platform. Such conduct constitutes a serious breach of this Agreement.\n(4) In the event of payment circumvention, PDR Connect reserves the right to immediately suspend the Technician\'s profile, withhold any pending payments, and pursue all available legal remedies.\n(5) Approved earnings are transferred exclusively to the bank account provided by the Technician in their platform profile. The Technician is solely responsible for ensuring their banking details are accurate and up to date.\n(6) All Invoices must be issued to: Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus · VAT: CY60015676H.',
        },
        {
          h: '§5 Technician Obligations',
          list: [
            'Maintain an accurate, complete, and up-to-date profile including certifications, qualifications, and availability',
            'Upload and maintain all required documentation (valid ID, A1 certificate where applicable, professional certifications)',
            'Honor all accepted placements and agreed assignment terms',
            'Conduct all communications with Clients exclusively through the PDR Connect platform',
            'Notify PDR Connect promptly in case of inability to fulfill an accepted placement',
            'Maintain professional conduct and appropriate industry standards throughout all assignments',
          ],
        },
        {
          h: '§6 Professional Standards and Qualifications',
          p: '(1) The Technician warrants that all stated qualifications, experience, and certifications are accurate, genuine, and current.\n(2) The Technician agrees to perform all work to recognized professional industry standards.\n(3) PDR Connect may suspend a Technician\'s profile in case of verified professional misconduct, fraudulent documentation, or repeated breaches of this Agreement.',
        },
        {
          h: '§7 Independent Contractor Status',
          p: '(1) The Technician operates as an independent service provider. This Agreement does not establish an employment relationship between the Technician and PDR Connect.\n(2) The Technician is solely responsible for: all applicable taxes and social security contributions, professional liability insurance, and compliance with labor and immigration regulations in the country of work.\n(3) PDR Connect does not provide employee benefits, paid leave, or social security contributions on behalf of the Technician.',
        },
        {
          h: '§8 Confidentiality',
          p: '(1) The Technician agrees to keep all Client information, assignment details, and commercial terms confidential.\n(2) Technician personal data is processed in accordance with PDR Connect\'s Privacy Policy and applicable GDPR regulations.',
        },
        {
          h: '§9 Term and Termination',
          p: '(1) This Agreement is effective from the date of Technician registration on the PDR Connect platform.\n(2) Either Party may terminate this Agreement with 14 days\' written notice to info@cybratech-solutions.com.\n(3) Termination does not affect payment obligations for completed or active assignments.\n(4) In cases of serious breach, fraudulent conduct, or document fraud, PDR Connect may terminate with immediate effect.',
        },
        {
          h: '§10 Governing Law and Jurisdiction',
          p: 'This Agreement is governed exclusively by the laws of the Republic of Cyprus. Any disputes shall be brought before the competent courts of Nicosia, Cyprus.',
        },
        {
          h: '§11 Amendments',
          p: 'PDR Connect reserves the right to amend these terms with 30 days\' advance notice. Continued use of the platform after the notice period constitutes acceptance of the amended terms.',
        },
      ],
    },
  },

  /* ─────────────── GERMAN ─────────────── */
  de: {
    pageTitle: 'Plattform-Verträge',
    pageSubtitle: 'Zwei Vertragsversionen — für Kunden und für Techniker/Fachkräfte',
    tabClient: '🏢 Für Kunden / Auftraggeber',
    tabWorker: '🔧 Für Techniker / Fachkräfte',
    client: {
      title: 'Vermittlungs- und Dienstleistungsvertrag',
      badge: 'Kunden-/Auftraggeber-Version',
      printBtn: 'Drucken / Als PDF speichern',
      parties: {
        label: 'Vertragsparteien',
        operator: 'PDR Connect, betrieben von Cybratech Solutions Ltd., Efesou 9, 5280 Paralimni, Republik Zypern, USt-IdNr. CY60015676H — nachfolgend „PDR Connect"',
        client: 'Das auf der Plattform registrierte Unternehmen, Autohaus, die Werkstatt oder Einzelperson — nachfolgend „Kunde"',
      },
      intro: 'Dieser Vertrag regelt die Vermittlungsdienstleistungen von PDR Connect für den Kunden. Mit der Registrierung auf der PDR Connect Plattform akzeptiert der Kunde diesen Vertrag vollständig.',
      sections: [
        {
          h: '§1 Vertragsgegenstand',
          p: 'PDR Connect erbringt professionelle Personalvermittlungsdienstleistungen und präsentiert dem Kunden verifizierte PDR-Techniker und Kfz-Fachkräfte über die PDR Connect Plattform (pdrconnect.com).',
        },
        {
          h: '§2 Von PDR Connect erbrachte Leistungen',
          p: 'PDR Connect erbringt folgende Leistungen für den Kunden:',
          list: [
            'Identifizierung und Präsentation verifizierter Techniker gemäß den Anforderungen des Kunden',
            'Verifizierung beruflicher Qualifikationen, Zertifikate und Ausweisdokumente',
            'Erleichterung sicherer Kommunikation zwischen Kunde und Techniker über die Plattform',
            'Ausstellung aller Rechnungen und Abwicklung aller Zahlungen',
            'Laufender Support während des gesamten Vermittlungsprozesses',
          ],
        },
        {
          h: '§3 Plattformservice — Auftraggeber (Derzeit kostenlos)',
          p: '(1) In der aktuellen Startphase erbringt PDR Connect seine Vermittlungs- und Matching-Leistungen für Auftraggeber kostenlos. Es wird keine Plattformgebühr vom Auftraggeber erhoben.\n(2) Auftraggeber zahlen ausschließlich die vereinbarte Technikervergütung gemäß der von PDR Connect ausgestellten Rechnung. Es fallen keine zusätzlichen Gebühren an.\n(3) Beispiel: Bei einer vereinbarten Technikervergütung von 1.000 € erhält der Auftraggeber eine Rechnung über genau 1.000 €.\n(4) PDR Connect behält sich vor, in Zukunft eine Plattformgebühr für Auftraggeber einzuführen. Auftraggeber werden mit mindestens 30 Tagen Vorankündigung informiert, bevor eine solche Gebühr in Kraft tritt.',
        },
        {
          h: '§4 Zahlungsbedingungen',
          p: '(1) Als Auftraggeber/Contractor haben Sie freien, kostenlosen Zugang zu unserer APP. Falls jedoch eine Zahlungsverpflichtung entsteht, gelten folgende Bedingungen:\n(2) Alle Rechnungen sind binnen 14 Tagen nach Rechnungsdatum an den Betreiber dieser Plattform zu zahlen: „Betrieben von Cybratech-Solutions · Efesou 9, 5280 Paralimni, Zypern · USt-IdNr.: CY60015676H".\n(3) Alle Zahlungen sind ausschließlich an den Betreiber dieser Plattform zu überweisen: „Cybratech-Solutions · Efesou 9, 5280 Paralimni, Zypern · USt-IdNr.: CY60015676H". Direkte Zahlungen des Kunden an Techniker außerhalb der Plattform sind streng verboten.\n(4) Bei Zahlungsumgehung behält sich PDR Connect vor, das Konto zu sperren, die ausstehende Gebühr zzgl. Aufschlag zu berechnen und Rechtsbehelfe einzuleiten.\n(5) Verzugszinsen richten sich nach anwendbarem zypriotischem Recht.',
        },
        {
          h: '§5 Kundenpflichten',
          list: [
            'Genaue und vollständige Auftragsanforderungen bereitstellen',
            'Sichere und legale Arbeitsumgebung für vermittelte Techniker gewährleisten',
            'Alle anwendbaren Arbeitsgesetze im Einsatzland einhalten',
            'Vereinbarte Auftragsbedingungen einschließlich Dauer, Umfang und Vergütung einhalten',
            'Kommunikation ausschließlich über die PDR Connect Plattform führen',
            'Keine direkten Beschäftigungsbeziehungen mit Technikern außerhalb von PDR Connect eingehen',
          ],
        },
        {
          h: '§6 Technikerverifizierung und Gewährleistung',
          p: '(1) PDR Connect versichert, dass alle präsentierten Techniker durch offizielle Dokumente verifiziert wurden.\n(2) PDR Connect garantiert keine spezifischen Arbeitsergebnisse oder Resultate.\n(3) Der Kunde ist verantwortlich für die Beurteilung der Eignung der präsentierten Techniker.',
        },
        {
          h: '§7 Haftung',
          p: '(1) Die Haftung von PDR Connect ist auf die gezahlten Plattformgebühren für den betreffenden Einsatz begrenzt.\n(2) PDR Connect haftet nicht für Arbeitqualitätsstreitigkeiten, Schäden aus dem Verhalten des Technikers oder Folgeschäden.\n(3) Der Kunde übernimmt die volle Haftung für die Einhaltung lokaler Arbeits- und Steuervorschriften im Einsatzland.',
        },
        {
          h: '§8 Vertraulichkeit',
          p: '(1) Beide Parteien behandeln alle Konditionen, Preise und Auftragsdetails vertraulich.\n(2) Kundendaten werden gemäß der Datenschutzerklärung von PDR Connect und DSGVO verarbeitet.',
        },
        {
          h: '§9 Laufzeit und Kündigung',
          p: '(1) Dieser Vertrag gilt ab dem Datum der Kundenregistrierung auf der PDR Connect Plattform.\n(2) Jede Partei kann mit 14-tägiger schriftlicher Frist per E-Mail an info@cybratech-solutions.com kündigen.\n(3) Eine Kündigung berührt nicht Zahlungsverpflichtungen aus laufenden Einsätzen.\n(4) Bei schwerwiegenden Verstößen kann PDR Connect fristlos kündigen.',
        },
        {
          h: '§10 Anwendbares Recht und Gerichtsstand',
          p: 'Dieser Vertrag unterliegt ausschließlich dem Recht der Republik Zypern. Streitigkeiten sind vor den zuständigen Gerichten in Nikosia, Zypern, zu klären.',
        },
        {
          h: '§11 Änderungen',
          p: 'PDR Connect behält sich vor, diese Bedingungen mit 30 Tagen Vorankündigung zu ändern. Die weitere Nutzung gilt als Zustimmung zu den geänderten Bedingungen.',
        },
      ],
    },
    worker: {
      title: 'Vermittlungs- und Dienstleistungsvertrag',
      badge: 'Techniker-/Fachkraft-Version',
      printBtn: 'Drucken / Als PDF speichern',
      parties: {
        label: 'Vertragsparteien',
        operator: 'PDR Connect, betrieben von Cybratech Solutions Ltd., Efesou 9, 5280 Paralimni, Republik Zypern, USt-IdNr. CY60015676H — nachfolgend „PDR Connect"',
        client: 'Die auf der Plattform registrierte Einzelperson (Fachkraft) — nachfolgend „Techniker"',
      },
      intro: 'Dieser Vertrag regelt die Vermittlungsdienstleistungen von PDR Connect für den Techniker. Mit der Registrierung auf der PDR Connect Plattform akzeptiert der Techniker diesen Vertrag vollständig.',
      sections: [
        {
          h: '§1 Vertragsgegenstand',
          p: 'PDR Connect erbringt Personalvermittlungsdienstleistungen und vermittelt den Techniker an Kundenunternehmen, die Kfz-Fachkräfte benötigen, über die PDR Connect Plattform (pdrconnect.com).',
        },
        {
          h: '§2 Von PDR Connect erbrachte Leistungen',
          p: 'PDR Connect erbringt folgende Leistungen für den Techniker:',
          list: [
            'Aktive Vermarktung des Technikerprofils gegenüber Kundenunternehmen',
            'Erleichterung sicherer Kommunikation zwischen Techniker und potenziellen Kunden',
            'Ausstellung aller Rechnungen an Kunden und Abwicklung aller Zahlungen',
            'Überweisung der Technikervergütung (abzüglich Plattformgebühr) nach Zahlungseingang',
            'Support während des gesamten Vermittlungsprozesses',
          ],
        },
        {
          h: '§3 Plattformgebühr — Techniker',
          p: '(1) PDR Connect behält eine Plattformdienstleistungsgebühr von 10 % des vereinbarten Gesamtauftragswertes als Vermittlungs- und Verwaltungsgebühr ein.\n(2) Diese Gebühr wird vom Gesamtauftragswert abgezogen, bevor die Zahlung an den Techniker überwiesen wird.\n(3) Beispiel: Bei einem vereinbarten Auftragswert von 1.000 € behält PDR Connect 100 € (10 %) ein und der Techniker erhält 900 €.\n(4) Die Gebühr deckt ab: Profilvermarktung, Kundenvermittlung, Kommunikation, Rechnungsverwaltung und Zahlungsabwicklung.\n(5) PDR Connect behält sich vor, die Plattformgebühr mit 30 Tagen Vorankündigung anzupassen.',
        },
        {
          h: '§4 Zahlungsbedingungen für Techniker / Arbeitnehmer',
          p: '(1) PDR Connect überweist die Vergütung des Technikers/Arbeitnehmers innerhalb von 7 Werktagen, nachdem die vom Techniker/Arbeitnehmer ausgestellte Rechnung bei PDR Connect eingegangen ist UND von PDR Connect geprüft und freigegeben wurde.\n(2) Techniker/Arbeitnehmer dürfen eine Rechnung an PDR Connect (Cybratech Solutions Ltd.) ausschließlich dann ausstellen, nachdem sie von PDR Connect ausdrücklich darüber informiert wurden, dass der vollständige Zahlungseingang des Kunden auf der Plattform bestätigt wurde. Rechnungen, die vor dieser Benachrichtigung ausgestellt werden, sind ungültig und werden nicht bearbeitet.\n(3) Der Techniker darf keine direkten Zahlungen von Kunden außerhalb der PDR Connect-Plattform anfordern, annehmen oder vermitteln. Ein solches Verhalten stellt einen schwerwiegenden Vertragsbruch dar.\n(4) Bei Zahlungsumgehung behält sich PDR Connect vor, das Profil des Technikers sofort zu sperren, ausstehende Zahlungen einzubehalten und alle verfügbaren Rechtsbehelfe einzuleiten.\n(5) Freigegebene Vergütungen werden ausschließlich auf das Bankkonto überwiesen, das der Techniker in seinem Plattformprofil hinterlegt hat. Der Techniker trägt die alleinige Verantwortung dafür, dass seine Bankdaten korrekt und aktuell sind.\n(6) Alle Rechnungen sind auszustellen an: Cybratech-Solutions · Efesou 9, 5280 Paralimni, Zypern · USt-IdNr.: CY60015676H.',
        },
        {
          h: '§5 Technikerpflichten',
          list: [
            'Genaues, vollständiges und aktuelles Profil mit Zertifikaten und Verfügbarkeit pflegen',
            'Alle erforderlichen Dokumente hochladen und aktuell halten (Ausweis, A1-Bescheinigung, Zertifikate)',
            'Alle zugesagten Einsätze und vereinbarten Auftragsbedingungen einhalten',
            'Kommunikation mit Kunden ausschließlich über die PDR Connect Plattform führen',
            'PDR Connect unverzüglich benachrichtigen, wenn ein Einsatz nicht angetreten werden kann',
            'Professionelles Verhalten und Branchenstandards bei allen Einsätzen einhalten',
          ],
        },
        {
          h: '§6 Berufsstandards und Qualifikationen',
          p: '(1) Der Techniker versichert, dass alle angegebenen Qualifikationen, Erfahrungen und Zertifikate korrekt, authentisch und aktuell sind.\n(2) Der Techniker verpflichtet sich, alle Arbeiten gemäß professionellen Branchenstandards auszuführen.\n(3) PDR Connect kann das Profil eines Technikers bei nachgewiesenem Fehlverhalten, gefälschten Dokumenten oder wiederholten Verstößen sperren.',
        },
        {
          h: '§7 Status als selbstständiger Dienstleister',
          p: '(1) Der Techniker ist als selbstständiger Dienstleister tätig. Dieser Vertrag begründet kein Arbeitsverhältnis zwischen Techniker und PDR Connect.\n(2) Der Techniker ist allein verantwortlich für: Steuern und Sozialabgaben, Berufshaftpflichtversicherung, Einhaltung von Arbeits- und Einwanderungsvorschriften im Einsatzland.\n(3) PDR Connect erbringt keine Arbeitgeberleistungen, Urlaubsansprüche oder Sozialversicherungsbeiträge.',
        },
        {
          h: '§8 Vertraulichkeit',
          p: '(1) Der Techniker behandelt alle Kundeninformationen, Auftragsdetails und Konditionen vertraulich.\n(2) Technikerdaten werden gemäß der Datenschutzerklärung von PDR Connect und DSGVO verarbeitet.',
        },
        {
          h: '§9 Laufzeit und Kündigung',
          p: '(1) Dieser Vertrag gilt ab dem Datum der Technikerregistrierung auf der PDR Connect Plattform.\n(2) Jede Partei kann mit 14-tägiger schriftlicher Frist per E-Mail an info@cybratech-solutions.com kündigen.\n(3) Eine Kündigung berührt nicht Zahlungsverpflichtungen aus abgeschlossenen oder laufenden Einsätzen.\n(4) Bei schwerwiegenden Verstößen, betrügerischem Verhalten oder Dokumentenfälschung kann PDR Connect fristlos kündigen.',
        },
        {
          h: '§10 Anwendbares Recht und Gerichtsstand',
          p: 'Dieser Vertrag unterliegt ausschließlich dem Recht der Republik Zypern. Streitigkeiten sind vor den zuständigen Gerichten in Nikosia, Zypern, zu klären.',
        },
        {
          h: '§11 Änderungen',
          p: 'PDR Connect behält sich vor, diese Bedingungen mit 30 Tagen Vorankündigung zu ändern. Die weitere Nutzung gilt als Zustimmung zu den geänderten Bedingungen.',
        },
      ],
    },
  },

  /* ─────────────── GREEK ─────────────── */
  el: {
    pageTitle: 'Συμβόλαια Πλατφόρμας',
    pageSubtitle: 'Δύο εκδόσεις συμβολαίου — για Πελάτες και για Τεχνικούς/Εργαζομένους',
    tabClient: '🏢 Για Πελάτες / Εργολάβους',
    tabWorker: '🔧 Για Τεχνικούς / Εργαζομένους',
    client: {
      title: 'Σύμβαση Τοποθέτησης και Υπηρεσιών',
      badge: 'Έκδοση Πελάτη / Εργολάβου',
      printBtn: 'Εκτύπωση / Αποθήκευση ως PDF',
      parties: {
        label: 'Συμβαλλόμενα Μέρη',
        operator: 'PDR Connect, που λειτουργεί από την Cybratech Solutions Ltd., Efesou 9, 5280 Παραλίμνι, Κυπριακή Δημοκρατία, ΑΦΜ CY60015676H — εφεξής «PDR Connect»',
        client: 'Η εταιρεία, αντιπροσωπεία, συνεργείο ή φυσικό πρόσωπο εγγεγραμμένο στην πλατφόρμα — εφεξής «Πελάτης»',
      },
      intro: 'Η παρούσα Σύμβαση διέπει τις υπηρεσίες τοποθέτησης που παρέχει η PDR Connect στον Πελάτη. Με την εγγραφή στην πλατφόρμα PDR Connect, ο Πελάτης αποδέχεται πλήρως την παρούσα Σύμβαση.',
      sections: [
        {
          h: '§1 Αντικείμενο Σύμβασης',
          p: 'Η PDR Connect παρέχει επαγγελματικές υπηρεσίες τοποθέτησης προσωπικού, εντοπίζοντας και παρουσιάζοντας στον Πελάτη επαληθευμένους τεχνικούς PDR και επαγγελματίες αυτοκινήτων μέσω της πλατφόρμας PDR Connect (pdrconnect.com).',
        },
        {
          h: '§2 Υπηρεσίες της PDR Connect',
          p: 'Η PDR Connect παρέχει τις ακόλουθες υπηρεσίες στον Πελάτη:',
          list: [
            'Εντοπισμός και παρουσίαση επαληθευμένων τεχνικών που ανταποκρίνονται στις απαιτήσεις του Πελάτη',
            'Επαλήθευση επαγγελματικών προσόντων, πιστοποιητικών και εγγράφων ταυτότητας',
            'Διευκόλυνση ασφαλούς επικοινωνίας μεταξύ Πελάτη και Τεχνικού μέσω της πλατφόρμας',
            'Έκδοση όλων των τιμολογίων και διεκπεραίωση όλων των πληρωμών',
            'Συνεχής υποστήριξη καθ\' όλη τη διάρκεια της διαδικασίας τοποθέτησης',
          ],
        },
        {
          h: '§3 Υπηρεσία Πλατφόρμας — Πελάτης (Προς το Παρόν Δωρεάν)',
          p: '(1) Κατά τη διάρκεια της τρέχουσας φάσης εκκίνησης, η PDR Connect παρέχει τις υπηρεσίες τοποθέτησης και αντιστοίχισης στους Πελάτες δωρεάν. Δεν χρεώνεται καμία αμοιβή πλατφόρμας στον Πελάτη.\n(2) Οι Πελάτες πληρώνουν αποκλειστικά τη συμφωνηθείσα αμοιβή τεχνικού σύμφωνα με το τιμολόγιο που εκδίδει η PDR Connect. Δεν εφαρμόζεται καμία πρόσθετη χρέωση.\n(3) Παράδειγμα: Εάν η συμφωνηθείσα αμοιβή τεχνικού είναι 1.000 €, ο Πελάτης τιμολογείται για ακριβώς 1.000 €.\n(4) Η PDR Connect διατηρεί το δικαίωμα να εισαγάγει αμοιβή πλατφόρμας για τους Πελάτες στο μέλλον. Οι Πελάτες θα ενημερώνονται με τουλάχιστον 30 ημέρες προειδοποίηση πριν από την εφαρμογή οποιασδήποτε τέτοιας χρέωσης.',
        },
        {
          h: '§4 Όροι Πληρωμής',
          p: '(1) Ως Πελάτης/Εργολάβος έχετε ελεύθερη και δωρεάν πρόσβαση στην εφαρμογή μας. Ωστόσο, εάν προκύψει υποχρέωση πληρωμής, ισχύουν τα ακόλουθα:\n(2) Όλα τα τιμολόγια είναι πληρωτέα στον Φορέα Εκμετάλλευσης αυτής της Πλατφόρμας: «Διαχειρίζεται η Cybratech-Solutions · Efesou 9, 5280 Paralimni, Κύπρος · ΑΦΜ: CY60015676H» εντός 14 ημερών από την ημερομηνία έκδοσης τιμολογίου.\n(3) Όλες οι πληρωμές πρέπει να μεταφέρονται αποκλειστικά στον Φορέα Εκμετάλλευσης αυτής της Πλατφόρμας: «Cybratech-Solutions · Efesou 9, 5280 Paralimni, Κύπρος · ΑΦΜ: CY60015676H». Άμεσες πληρωμές από τον Πελάτη στους Τεχνικούς εκτός πλατφόρμας απαγορεύονται αυστηρά.\n(4) Σε περίπτωση παράκαμψης πληρωμής, η PDR Connect διατηρεί το δικαίωμα να αναστείλει τον λογαριασμό, να χρεώσει την αμοιβή πλατφόρμας πλέον προσαύξησης και να ασκήσει νομικά μέσα.\n(5) Καθυστερημένες πληρωμές ενδέχεται να υπόκεινται σε νόμιμους τόκους βάσει του εφαρμοστέου κυπριακού δικαίου.',
        },
        {
          h: '§5 Υποχρεώσεις Πελάτη',
          list: [
            'Παρέχει ακριβείς και πλήρεις απαιτήσεις εργασίας κατά την αίτηση τοποθέτησης',
            'Εξασφαλίζει ασφαλές και νόμιμο εργασιακό περιβάλλον για όλους τους τοποθετούμενους τεχνικούς',
            'Συμμορφώνεται με όλη την ισχύουσα εργατική νομοθεσία στη χώρα εργασίας',
            'Τηρεί τους συμφωνηθέντες όρους ανάθεσης συμπεριλαμβανομένης διάρκειας και αμοιβής',
            'Διεξάγει όλη την επικοινωνία με τεχνικούς αποκλειστικά μέσω της πλατφόρμας PDR Connect',
            'Δεν δημιουργεί απευθείας σχέσεις εργασίας με τοποθετούμενους τεχνικούς εκτός PDR Connect',
          ],
        },
        {
          h: '§6 Επαλήθευση Τεχνικού και Εγγύηση',
          p: '(1) Η PDR Connect εγγυάται ότι όλοι οι παρουσιαζόμενοι τεχνικοί έχουν επαληθευτεί μέσω επίσημων εγγράφων.\n(2) Η PDR Connect δεν εγγυάται συγκεκριμένα αποτελέσματα εργασίας ή επίπεδα παραγωγικότητας.\n(3) Ο Πελάτης είναι υπεύθυνος για την αξιολόγηση της καταλληλότητας των παρουσιαζόμενων τεχνικών.',
        },
        {
          h: '§7 Ευθύνη',
          p: '(1) Η ευθύνη της PDR Connect περιορίζεται στις συνολικές αμοιβές πλατφόρμας που κατέβαλε ο Πελάτης.\n(2) Η PDR Connect δεν ευθύνεται για διαφορές ποιότητας εργασίας, ζημίες από τη συμπεριφορά τεχνικού ή επακόλουθες απώλειες.\n(3) Ο Πελάτης αναλαμβάνει πλήρη ευθύνη για τη συμμόρφωση με τοπικές εργατικές και φορολογικές διατάξεις.',
        },
        {
          h: '§8 Εμπιστευτικότητα',
          p: '(1) Τα Μέρη συμφωνούν να τηρούν εμπιστευτικά όλους τους εμπορικούς όρους και λεπτομέρειες ανάθεσης.\n(2) Τα δεδομένα Πελάτη επεξεργάζονται σύμφωνα με την Πολιτική Απορρήτου της PDR Connect και τον ΓΚΠΔ.',
        },
        {
          h: '§9 Διάρκεια και Καταγγελία',
          p: '(1) Η Σύμβαση ισχύει από την ημερομηνία εγγραφής του Πελάτη στην πλατφόρμα PDR Connect.\n(2) Κάθε Μέρος μπορεί να καταγγείλει τη Σύμβαση με 14 ημέρες γραπτή ειδοποίηση στο info@cybratech-solutions.com.\n(3) Η καταγγελία δεν επηρεάζει υποχρεώσεις πληρωμής από ενεργές αναθέσεις.\n(4) Σε περίπτωση σοβαρής παράβασης, η PDR Connect μπορεί να καταγγείλει τη Σύμβαση άμεσα.',
        },
        {
          h: '§10 Εφαρμοστέο Δίκαιο και Δικαιοδοσία',
          p: 'Η παρούσα Σύμβαση διέπεται αποκλειστικά από τους νόμους της Κυπριακής Δημοκρατίας. Οι διαφορές εκδικάζονται ενώπιον των αρμόδιων δικαστηρίων Λευκωσίας, Κύπρος.',
        },
        {
          h: '§11 Τροποποιήσεις',
          p: 'Η PDR Connect διατηρεί το δικαίωμα να τροποποιεί τους όρους με 30 ημέρες προειδοποίηση. Η συνέχιση χρήσης συνιστά αποδοχή των τροποποιημένων όρων.',
        },
      ],
    },
    worker: {
      title: 'Σύμβαση Τοποθέτησης και Υπηρεσιών',
      badge: 'Έκδοση Τεχνικού / Εργαζομένου',
      printBtn: 'Εκτύπωση / Αποθήκευση ως PDF',
      parties: {
        label: 'Συμβαλλόμενα Μέρη',
        operator: 'PDR Connect, που λειτουργεί από την Cybratech Solutions Ltd., Efesou 9, 5280 Παραλίμνι, Κυπριακή Δημοκρατία, ΑΦΜ CY60015676H — εφεξής «PDR Connect»',
        client: 'Το φυσικό πρόσωπο (επαγγελματίας) εγγεγραμμένο στην πλατφόρμα — εφεξής «Τεχνικός»',
      },
      intro: 'Η παρούσα Σύμβαση διέπει τις υπηρεσίες τοποθέτησης που παρέχει η PDR Connect στον Τεχνικό. Με την εγγραφή στην πλατφόρμα PDR Connect, ο Τεχνικός αποδέχεται πλήρως την παρούσα Σύμβαση.',
      sections: [
        {
          h: '§1 Αντικείμενο Σύμβασης',
          p: 'Η PDR Connect παρέχει υπηρεσίες τοποθέτησης, αντιστοιχίζοντας τον Τεχνικό με επιχειρήσεις-πελάτες που χρειάζονται ειδικευμένους επαγγελματίες αυτοκινήτων, μέσω της πλατφόρμας PDR Connect (pdrconnect.com).',
        },
        {
          h: '§2 Υπηρεσίες της PDR Connect',
          p: 'Η PDR Connect παρέχει τις ακόλουθες υπηρεσίες στον Τεχνικό:',
          list: [
            'Ενεργή προώθηση του προφίλ του Τεχνικού σε επιχειρήσεις-πελάτες',
            'Διευκόλυνση ασφαλούς επικοινωνίας μεταξύ Τεχνικού και δυνητικών Πελατών',
            'Έκδοση όλων των τιμολογίων στους Πελάτες και διεκπεραίωση όλων των πληρωμών',
            'Μεταφορά αμοιβής Τεχνικού (μείον αμοιβή πλατφόρμας) μετά λήψη πληρωμής',
            'Υποστήριξη καθ\' όλη τη διάρκεια της διαδικασίας τοποθέτησης',
          ],
        },
        {
          h: '§3 Αμοιβή Πλατφόρμας — Τεχνικός',
          p: '(1) Η PDR Connect παρακρατεί αμοιβή πλατφόρμας 10% επί της συνολικής συμφωνηθείσας αξίας ανάθεσης ως αμοιβή τοποθέτησης και διαχείρισης.\n(2) Η αμοιβή αφαιρείται από τη συμφωνηθείσα αξία πριν το υπόλοιπο μεταφερθεί στον Τεχνικό.\n(3) Παράδειγμα: Για ανάθεση αξίας 1.000 €, η PDR Connect παρακρατεί 100 € (10%) και ο Τεχνικός λαμβάνει 900 €.\n(4) Η αμοιβή καλύπτει: προώθηση προφίλ, αντιστοίχιση πελατών, επικοινωνία, διαχείριση τιμολογίων και επεξεργασία πληρωμών.\n(5) Η PDR Connect διατηρεί το δικαίωμα να προσαρμόσει την αμοιβή με 30 ημέρες προειδοποίηση.',
        },
        {
          h: '§4 Όροι Πληρωμής για Τεχνικούς / Εργαζομένους',
          p: '(1) Η PDR Connect θα μεταφέρει την αμοιβή του Τεχνικού/Εργαζομένου εντός 7 εργάσιμων ημερών από τη λήψη του Τιμολογίου που εκδίδει ο Τεχνικός/Εργαζόμενος ΚΑΙ αφού η PDR Connect έχει εξετάσει και εγκρίνει το εν λόγω Τιμολόγιο.\n(2) Οι Τεχνικοί/Εργαζόμενοι δικαιούνται να εκδίδουν Τιμολόγιο προς την PDR Connect (Cybratech Solutions Ltd.) μόνον αφού τους κοινοποιηθεί επίσημα από την PDR Connect ότι η πλήρης πληρωμή από τον Πελάτη έχει ληφθεί από την Πλατφόρμα. Τιμολόγια που εκδίδονται πριν από αυτή την κοινοποίηση δεν είναι έγκυρα και δεν θα επεξεργαστούν.\n(3) Ο Τεχνικός δεν επιτρέπεται να αιτείται, αποδέχεται ή διευκολύνει άμεσες πληρωμές από Πελάτες εκτός της πλατφόρμας PDR Connect. Μια τέτοια συμπεριφορά συνιστά σοβαρή παράβαση της παρούσας Σύμβασης.\n(4) Σε περίπτωση παράκαμψης πληρωμής, η PDR Connect διατηρεί το δικαίωμα να αναστείλει αμέσως το προφίλ του Τεχνικού, να παρακρατήσει τυχόν εκκρεμείς πληρωμές και να κάνει χρήση όλων των διαθέσιμων νομικών μέσων.\n(5) Οι εγκεκριμένες αμοιβές μεταφέρονται αποκλειστικά στον τραπεζικό λογαριασμό που έχει δηλώσει ο Τεχνικός στο προφίλ του στην πλατφόρμα. Ο Τεχνικός φέρει αποκλειστική ευθύνη για την ακρίβεια και την ενημέρωση των τραπεζικών στοιχείων του.\n(6) Όλα τα Τιμολόγια πρέπει να εκδίδονται προς: Cybratech-Solutions · Efesou 9, 5280 Paralimni, Κύπρος · ΑΦΜ: CY60015676H.',
        },
        {
          h: '§5 Υποχρεώσεις Τεχνικού',
          list: [
            'Διατήρηση ακριβούς, πλήρους και ενημερωμένου προφίλ με πιστοποιητικά και διαθεσιμότητα',
            'Αναφόρτωση και διατήρηση όλων των απαιτούμενων εγγράφων (ταυτότητα, πιστοποιητικό Α1, πιστοποιητικά)',
            'Τήρηση όλων των αποδεκτών αναθέσεων και συμφωνηθέντων όρων',
            'Επικοινωνία με Πελάτες αποκλειστικά μέσω της πλατφόρμας PDR Connect',
            'Άμεση ειδοποίηση της PDR Connect σε περίπτωση αδυναμίας εκπλήρωσης ανάθεσης',
            'Διατήρηση επαγγελματικής συμπεριφοράς και βιομηχανικών προτύπων σε όλες τις αναθέσεις',
          ],
        },
        {
          h: '§6 Επαγγελματικά Πρότυπα και Προσόντα',
          p: '(1) Ο Τεχνικός εγγυάται ότι όλα τα δηλωθέντα προσόντα, εμπειρία και πιστοποιητικά είναι ακριβή, αυθεντικά και ισχύοντα.\n(2) Ο Τεχνικός αναλαμβάνει να εκτελεί όλες τις εργασίες σύμφωνα με αναγνωρισμένα επαγγελματικά πρότυπα.\n(3) Η PDR Connect δύναται να αναστείλει το προφίλ σε περίπτωση επαγγελματικής ατασθαλίας, πλαστών εγγράφων ή επανειλημμένων παραβάσεων.',
        },
        {
          h: '§7 Καθεστώς Ανεξάρτητου Εργολάβου',
          p: '(1) Ο Τεχνικός λειτουργεί ως ανεξάρτητος πάροχος υπηρεσιών. Η παρούσα Σύμβαση δεν δημιουργεί σχέση εργασίας μεταξύ Τεχνικού και PDR Connect.\n(2) Ο Τεχνικός είναι αποκλειστικά υπεύθυνος για: φόρους και εισφορές κοινωνικής ασφάλισης, ασφάλεια επαγγελματικής ευθύνης, συμμόρφωση με εργατική νομοθεσία στη χώρα εργασίας.\n(3) Η PDR Connect δεν παρέχει παροχές εργαζομένου ή εισφορές κοινωνικής ασφάλισης.',
        },
        {
          h: '§8 Εμπιστευτικότητα',
          p: '(1) Ο Τεχνικός συμφωνεί να τηρεί εμπιστευτικές όλες τις πληροφορίες Πελατών, λεπτομέρειες αναθέσεων και εμπορικούς όρους.\n(2) Τα προσωπικά δεδομένα Τεχνικού επεξεργάζονται σύμφωνα με την Πολιτική Απορρήτου της PDR Connect και τον ΓΚΠΔ.',
        },
        {
          h: '§9 Διάρκεια και Καταγγελία',
          p: '(1) Η Σύμβαση ισχύει από την ημερομηνία εγγραφής του Τεχνικού στην πλατφόρμα PDR Connect.\n(2) Κάθε Μέρος μπορεί να καταγγείλει τη Σύμβαση με 14 ημέρες γραπτή ειδοποίηση στο info@cybratech-solutions.com.\n(3) Η καταγγελία δεν επηρεάζει υποχρεώσεις πληρωμής από ολοκληρωμένες ή ενεργές αναθέσεις.\n(4) Σε περίπτωση σοβαρής παράβασης ή πλαστογραφίας εγγράφων, η PDR Connect μπορεί να καταγγείλει άμεσα.',
        },
        {
          h: '§10 Εφαρμοστέο Δίκαιο και Δικαιοδοσία',
          p: 'Η παρούσα Σύμβαση διέπεται αποκλειστικά από τους νόμους της Κυπριακής Δημοκρατίας. Οι διαφορές εκδικάζονται ενώπιον των αρμόδιων δικαστηρίων Λευκωσίας, Κύπρος.',
        },
        {
          h: '§11 Τροποποιήσεις',
          p: 'Η PDR Connect διατηρεί το δικαίωμα να τροποποιεί τους όρους με 30 ημέρες προειδοποίηση. Η συνέχιση χρήσης συνιστά αποδοχή των τροποποιημένων όρων.',
        },
      ],
    },
  },

  /* ─────────────── SPANISH ─────────────── */
  es: {
    pageTitle: 'Contratos de Plataforma',
    pageSubtitle: 'Dos versiones de contrato — para Clientes y para Técnicos/Trabajadores',
    tabClient: '🏢 Para Clientes / Contratistas',
    tabWorker: '🔧 Para Técnicos / Trabajadores',
    client: {
      title: 'Acuerdo de Colocación y Servicios',
      badge: 'Versión Cliente / Contratista',
      printBtn: 'Imprimir / Guardar como PDF',
      parties: {
        label: 'Partes',
        operator: 'PDR Connect, operado por Cybratech Solutions Ltd., Efesou 9, 5280 Paralimni, República de Chipre, NIF CY60015676H — en adelante "PDR Connect"',
        client: 'La empresa, concesionario, taller o individuo registrado en la plataforma — en adelante "Cliente"',
      },
      intro: 'Este Acuerdo regula los servicios de colocación proporcionados por PDR Connect al Cliente. Al registrarse en la plataforma PDR Connect, el Cliente acepta este Acuerdo en su totalidad.',
      sections: [
        {
          h: '§1 Objeto del Acuerdo',
          p: 'PDR Connect proporciona servicios profesionales de colocación de personal, buscando y presentando al Cliente técnicos PDR verificados y profesionales del automóvil a través de la plataforma PDR Connect (pdrconnect.com).',
        },
        {
          h: '§2 Servicios Proporcionados por PDR Connect',
          p: 'PDR Connect proporciona los siguientes servicios al Cliente:',
          list: [
            'Identificación y presentación de técnicos verificados que cumplan los requisitos del Cliente',
            'Verificación de credenciales profesionales, certificaciones y documentos de identidad',
            'Facilitación de comunicación segura entre Cliente y Técnico a través de la plataforma',
            'Emisión de todas las facturas y procesamiento de todos los pagos',
            'Apoyo continuo durante todo el proceso de colocación',
          ],
        },
        {
          h: '§3 Servicio de Plataforma — Cliente (Actualmente Gratuito)',
          p: '(1) Durante la fase de lanzamiento actual, PDR Connect proporciona sus servicios de colocación y matching a los Clientes de forma gratuita. No se cobra ninguna tarifa de plataforma al Cliente.\n(2) Los Clientes pagan únicamente la remuneración acordada del técnico según la factura emitida por PDR Connect. No se aplica ningún cargo adicional de plataforma.\n(3) Ejemplo: Si la remuneración acordada del técnico es de €1.000, el Cliente recibe una factura por exactamente €1.000.\n(4) PDR Connect se reserva el derecho de introducir una tarifa de servicio de plataforma para Clientes en el futuro. Los Clientes serán notificados con al menos 30 días de aviso previo antes de que dicha tarifa entre en vigor.',
        },
        {
          h: '§4 Condiciones de Pago',
          p: '(1) Como Cliente/Contratista, tiene acceso libre y gratuito a nuestra plataforma. Sin embargo, en caso de que surja alguna obligación de pago, se aplican las siguientes condiciones:\n(2) Todas las facturas son pagaderas a PDR Connect (Cybratech Solutions Ltd.) dentro de los 14 días siguientes a la fecha de la factura.\n(3) Todos los pagos deben transferirse exclusivamente a PDR Connect. Los pagos directos del Cliente a los Técnicos fuera de la plataforma están estrictamente prohibidos.\n(4) En caso de elusión de pagos, PDR Connect se reserva el derecho de suspender la cuenta, facturar la tarifa pendiente más un recargo y emprender acciones legales.\n(5) Los pagos tardíos pueden estar sujetos a intereses legales conforme a la ley chipriota aplicable.',
        },
        {
          h: '§5 Obligaciones del Cliente',
          list: [
            'Proporcionar requisitos de trabajo precisos y completos al solicitar colocaciones',
            'Garantizar un entorno de trabajo seguro, legal y profesionalmente apropiado para todos los técnicos colocados',
            'Cumplir con todas las leyes laborales aplicables en el país donde trabaja el técnico',
            'Respetar todos los términos acordados de la asignación incluyendo duración, alcance y remuneración',
            'Realizar todas las comunicaciones con los Técnicos exclusivamente a través de la plataforma PDR Connect',
            'No establecer relaciones de empleo o servicio directas con técnicos colocados fuera de PDR Connect',
          ],
        },
        {
          h: '§6 Verificación del Técnico y Garantía',
          p: '(1) PDR Connect garantiza que todos los técnicos presentados han sido verificados mediante documentación oficial.\n(2) PDR Connect no garantiza resultados específicos de trabajo, niveles de productividad ni resultados concretos.\n(3) El Cliente es responsable de evaluar la idoneidad de los técnicos presentados para sus requisitos específicos.',
        },
        {
          h: '§7 Responsabilidad',
          p: '(1) La responsabilidad de PDR Connect se limita a las tarifas de plataforma totales pagadas por el Cliente para la asignación relevante.\n(2) PDR Connect no es responsable de disputas sobre calidad del trabajo, daños derivados de la conducta del técnico o pérdidas consecuentes.\n(3) El Cliente asume plena responsabilidad por el cumplimiento de las normativas laborales y fiscales locales en el país de trabajo.',
        },
        {
          h: '§8 Confidencialidad',
          p: '(1) Ambas Partes acuerdan mantener confidenciales todos los términos comerciales y detalles de asignación.\n(2) Los datos del Cliente se procesan conforme a la Política de Privacidad de PDR Connect y el RGPD aplicable.',
        },
        {
          h: '§9 Vigencia y Rescisión',
          p: '(1) Este Acuerdo es efectivo desde la fecha de registro del Cliente en la plataforma PDR Connect.\n(2) Cualquiera de las Partes puede rescindir este Acuerdo con 14 días de aviso escrito a info@cybratech-solutions.com.\n(3) La rescisión no afecta a las obligaciones de pago de asignaciones activas en curso.\n(4) En casos de incumplimiento grave, PDR Connect puede rescindir este Acuerdo con efecto inmediato.',
        },
        {
          h: '§10 Ley Aplicable y Jurisdicción',
          p: 'Este Acuerdo se rige exclusivamente por las leyes de la República de Chipre. Las disputas se resolverán ante los tribunales competentes de Nicosia, Chipre.',
        },
        {
          h: '§11 Modificaciones',
          p: 'PDR Connect se reserva el derecho de modificar estos términos con 30 días de aviso previo. El uso continuado de la plataforma tras el período de aviso constituye aceptación de los términos modificados.',
        },
      ],
    },
    worker: {
      title: 'Acuerdo de Colocación y Servicios',
      badge: 'Versión Técnico / Trabajador',
      printBtn: 'Imprimir / Guardar como PDF',
      parties: {
        label: 'Partes',
        operator: 'PDR Connect, operado por Cybratech Solutions Ltd., Efesou 9, 5280 Paralimni, República de Chipre, NIF CY60015676H — en adelante "PDR Connect"',
        client: 'El profesional individual registrado en la plataforma — en adelante "Técnico"',
      },
      intro: 'Este Acuerdo regula los servicios de colocación proporcionados por PDR Connect al Técnico. Al registrarse en la plataforma PDR Connect, el Técnico acepta este Acuerdo en su totalidad.',
      sections: [
        {
          h: '§1 Objeto del Acuerdo',
          p: 'PDR Connect proporciona servicios profesionales de colocación, conectando al Técnico con empresas clientes que necesitan profesionales cualificados del automóvil, a través de la plataforma PDR Connect (pdrconnect.com).',
        },
        {
          h: '§2 Servicios Proporcionados por PDR Connect',
          p: 'PDR Connect proporciona los siguientes servicios al Técnico:',
          list: [
            'Promoción activa del perfil del Técnico a empresas clientes que buscan especialistas',
            'Facilitación de comunicación segura entre Técnico y posibles Clientes a través de la plataforma',
            'Emisión de todas las facturas a los Clientes y procesamiento de todos los pagos',
            'Transferencia de los ingresos del Técnico (menos la tarifa de plataforma) al recibir el pago del Cliente',
            'Apoyo y asistencia durante todo el proceso de colocación',
          ],
        },
        {
          h: '§3 Tarifa de Plataforma — Técnico',
          p: '(1) PDR Connect retiene una tarifa de servicio de plataforma del 10% del valor total acordado de la asignación como tarifa de colocación y administración.\n(2) Esta tarifa se deduce del valor acordado de la asignación antes de transferir el resto al Técnico.\n(3) Ejemplo: Para una asignación con un valor acordado de €1.000, PDR Connect retiene €100 (10%) y el Técnico recibe €900.\n(4) La tarifa cubre: marketing del perfil, matching con clientes, comunicación segura, administración de contratos y procesamiento de pagos.\n(5) PDR Connect se reserva el derecho de ajustar la tarifa con 30 días de aviso previo.',
        },
        {
          h: '§4 Condiciones de Pago para Técnicos / Trabajadores',
          p: '(1) PDR Connect transferirá los ingresos del Técnico/Trabajador dentro de los 7 días hábiles siguientes a la recepción de la Factura emitida por el Técnico/Trabajador Y después de que PDR Connect haya revisado y aprobado dicha Factura.\n(2) Los Técnicos/Trabajadores únicamente podrán emitir una Factura a PDR Connect (Cybratech Solutions Ltd.) después de haber sido notificados formalmente por PDR Connect de que el pago íntegro del Cliente ha sido recibido por la Plataforma. Las facturas emitidas con anterioridad a dicha notificación no son válidas y no serán procesadas.\n(3) El Técnico no debe solicitar, aceptar ni facilitar pagos directos de Clientes que eludan la plataforma PDR Connect. Tal conducta constituye un incumplimiento grave del presente Acuerdo.\n(4) En caso de elusión de pagos, PDR Connect se reserva el derecho de suspender inmediatamente el perfil del Técnico, retener cualquier pago pendiente y ejercer todos los recursos legales disponibles.\n(5) Los ingresos aprobados se transfieren exclusivamente a la cuenta bancaria proporcionada por el Técnico en su perfil de la plataforma. El Técnico es el único responsable de mantener sus datos bancarios correctos y actualizados.\n(6) Todas las Facturas deben emitirse a: Cybratech-Solutions · Efesou 9, 5280 Paralimni, Chipre · NIF: CY60015676H.',
        },
        {
          h: '§5 Obligaciones del Técnico',
          list: [
            'Mantener un perfil preciso, completo y actualizado con certificaciones, cualificaciones y disponibilidad',
            'Cargar y mantener toda la documentación requerida (DNI válido, certificado A1 cuando proceda, certificaciones)',
            'Respetar todas las colocaciones aceptadas y los términos de asignación acordados',
            'Realizar todas las comunicaciones con Clientes exclusivamente a través de la plataforma PDR Connect',
            'Notificar a PDR Connect de inmediato en caso de imposibilidad de cumplir una colocación aceptada',
            'Mantener una conducta profesional y los estándares del sector en todas las asignaciones',
          ],
        },
        {
          h: '§6 Estándares Profesionales y Cualificaciones',
          p: '(1) El Técnico garantiza que todas las cualificaciones, experiencia y certificaciones declaradas son precisas, genuinas y vigentes.\n(2) El Técnico se compromete a realizar todo el trabajo conforme a los estándares profesionales reconocidos del sector.\n(3) PDR Connect puede suspender el perfil de un Técnico en caso de mala conducta profesional verificada, documentación fraudulenta o incumplimientos reiterados.',
        },
        {
          h: '§7 Condición de Contratista Independiente',
          p: '(1) El Técnico opera como proveedor de servicios independiente. Este Acuerdo no establece una relación laboral entre el Técnico y PDR Connect.\n(2) El Técnico es el único responsable de: todos los impuestos y cotizaciones a la seguridad social aplicables, seguro de responsabilidad civil profesional, y cumplimiento de la normativa laboral y de inmigración en el país de trabajo.\n(3) PDR Connect no proporciona beneficios de empleado, vacaciones pagadas ni cotizaciones a la seguridad social en nombre del Técnico.',
        },
        {
          h: '§8 Confidencialidad',
          p: '(1) El Técnico acuerda mantener confidencial toda la información del Cliente, detalles de asignación y términos comerciales.\n(2) Los datos personales del Técnico se procesan conforme a la Política de Privacidad de PDR Connect y el RGPD aplicable.',
        },
        {
          h: '§9 Vigencia y Rescisión',
          p: '(1) Este Acuerdo es efectivo desde la fecha de registro del Técnico en la plataforma PDR Connect.\n(2) Cualquiera de las Partes puede rescindir este Acuerdo con 14 días de aviso escrito a info@cybratech-solutions.com.\n(3) La rescisión no afecta a las obligaciones de pago de asignaciones completadas o activas.\n(4) En casos de incumplimiento grave, conducta fraudulenta o falsificación de documentos, PDR Connect puede rescindir con efecto inmediato.',
        },
        {
          h: '§10 Ley Aplicable y Jurisdicción',
          p: 'Este Acuerdo se rige exclusivamente por las leyes de la República de Chipre. Las disputas se resolverán ante los tribunales competentes de Nicosia, Chipre.',
        },
        {
          h: '§11 Modificaciones',
          p: 'PDR Connect se reserva el derecho de modificar estos términos con 30 días de aviso previo. El uso continuado de la plataforma tras el período de aviso constituye aceptación de los términos modificados.',
        },
      ],
    },
  },
};

export default CONTRACTS;
