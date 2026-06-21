/**
 * Privacy Policy content — PDR Connect
 * Source document: "PDR Connect - Privacy Policy-02.06.2026.docx"
 * Effective date: 02 June 2026
 *
 * Used in:
 *  - ContractsModal (signing popup)
 *  - sign-legal page
 *  - /api/contracts/[id]/view (HTML/PDF generation)
 *  - /privacy page
 */

export type PrivacySection = {
  h: string;
  p?: string;
  sub?: string;
  list?: string[];
  p2?: string;
  note?: string;
};

export type PrivacyDoc = {
  title: string;
  subtitle: string;
  intro?: string;
  sections: PrivacySection[];
};

const PRIVACY_CONTENT: Record<string, PrivacyDoc> = {

  /* ══════════════════════════════════════════════════════════════════
     ENGLISH  (source document)
  ══════════════════════════════════════════════════════════════════ */
  en: {
    title: 'Privacy Policy',
    subtitle: 'PDR Connect · Cybratech Solutions Ltd. · Effective: 02 June 2026',
    intro: 'This Privacy Policy explains how Cybratech Solutions Ltd. ("we", "us", "our"), the operator of the PDR Connect platform, collects, uses, shares and protects personal data, and the rights you have over your personal data. It applies to clients, technicians, contractors and other visitors and users of the Platform. For the purposes of the EU General Data Protection Regulation (EU) 2016/679 ("GDPR") and the Cyprus Law Providing for the Protection of Natural Persons with regard to the Processing of Personal Data, Law 125(I)/2018, Cybratech Solutions Ltd. is the data controller for the processing described in this Policy.',
    sections: [
      {
        h: '1. Who We Are (Controller)',
        list: [
          'Controller: Cybratech Solutions Ltd.',
          'Registered office: Efesou 9, 5280 Paralimni, Republic of Cyprus',
          'VAT number: CY60015676H',
          'General contact: info@cybratech-solutions.com',
          'Website: pdrconnect.eu',
          'Data Protection Officer / privacy contact: DPCA Audit Tax Advisory - D. PAPADEMETRIOU LTD.',
          'EU/EEA representative: Not required — controller is established in the EU',
        ],
      },
      {
        h: '2. Our Role on a Two-Sided Platform',
        p: 'PDR Connect is a marketplace that connects technicians with clients. More than one party may handle your personal data in different roles:',
        list: [
          'We act as controller when we operate the Platform — for example, creating and managing accounts, verifying professional identities, processing payments, providing support, and securing the service.',
          'Platform members act as independent controllers for the personal data they receive about each other in order to perform an assignment (e.g. a client and a technician who agree to work together). Each member is responsible for its own use of that data.',
          'Where we and another party jointly determine the purposes and means of a specific processing activity, we will put in place a joint-controller arrangement under Article 26 GDPR.',
        ],
      },
      {
        h: '3. Personal Data We Collect',
        sub: 'We collect and process the following categories of personal data:',
        list: [
          'Account data: Full name; email address; telephone number; country of residence; professional role.',
          'Profile information: Biography; skills and qualifications; certifications; services offered; profile picture.',
          'Verification documents: Identity documents; A1 certificates; professional licences; travel and work-authorisation documents. (See §6 on special-category data.)',
          'Technical data: IP address; browser type and version; device information; login records; session information.',
          'Communication data: Messages exchanged through the Platform; support requests; contractual communications.',
        ],
      },
      {
        h: '4. Where We Obtain Your Data',
        p: 'Most personal data is provided directly by you when you register, build your profile, upload verification documents or communicate through the Platform. In some cases we receive personal data from other sources:',
        list: [
          'Other Platform members, where they share information about you in connection with an assignment.',
          'Identity-verification, anti-fraud and payment providers who confirm or supplement the information you provide.',
          'Public registers and competent authorities, where lawful and necessary for verification or compliance.',
        ],
      },
      {
        h: '5. Purposes and Legal Bases for Processing',
        sub: 'We process personal data only where we have a lawful basis under Article 6 GDPR:',
        list: [
          'Account creation & platform access — Registering and authenticating users; managing profiles. Legal basis: Contract performance (Art. 6(1)(b)).',
          'Matching & assignments — Connecting technicians and clients; enabling communication. Legal basis: Contract performance (Art. 6(1)(b)).',
          'Payments & invoicing — Processing payments, payouts and contract administration. Legal basis: Contract performance (Art. 6(1)(b)); legal obligation (Art. 6(1)(c)).',
          'Identity & qualification verification — Confirming professional identity and right to work. Legal basis: Legal obligation (Art. 6(1)(c)) and/or legitimate interests (Art. 6(1)(f)).',
          'Tax, accounting & record-keeping — Meeting statutory financial obligations. Legal basis: Legal obligation (Art. 6(1)(c)).',
          'Fraud prevention & platform security — Preventing abuse; monitoring for security threats. Legal basis: Legitimate interests (Art. 6(1)(f)).',
          'Service improvement & operations — Maintaining and improving the Platform. Legal basis: Legitimate interests (Art. 6(1)(f)).',
          'Customer support — Responding to requests and resolving issues. Legal basis: Contract performance (Art. 6(1)(b)); legitimate interests (Art. 6(1)(f)).',
          'Optional cookies / analytics / marketing — Where applicable. Legal basis: Consent (Art. 6(1)(a)).',
        ],
        note: 'Where we rely on legitimate interests, we have carried out a balancing test. You may ask us for more information and you have the right to object (see §11).',
      },
      {
        h: '6. Special-Category and Sensitive Data',
        p: 'Some verification documents may contain, or allow inferences about, data that falls within the special categories under Article 9 GDPR. Where we process such data, we rely on:',
        list: [
          'Processing necessary for carrying out obligations and exercising rights in the field of employment, social security and social-protection law — Art. 9(2)(b).',
          'Your explicit consent, where required — Art. 9(2)(a).',
        ],
        p2: 'We apply enhanced safeguards to this data, including access restrictions, encryption and minimised retention.',
      },
      {
        h: '7. Whether Providing Data Is Required',
        p: 'Providing account, profile and verification data is necessary to create an account and use the Platform. If you do not provide the data needed for registration, identity verification or payment, we will not be able to provide the relevant services or allow you to participate in assignments.',
        p2: 'Where processing is based on consent (e.g. optional cookies), provision is voluntary and you may withdraw consent at any time without affecting access to core services.',
      },
      {
        h: '8. Recipients and Data Sharing',
        sub: 'We share personal data only as necessary with the following categories of recipients:',
        list: [
          'Other verified Platform members, where necessary to arrange and perform assignments.',
          'Service providers acting as our processors, including: Stripe Inc. (payments), Supabase Inc. (database/storage, EU region), Resend Inc. (email delivery), Vercel Inc. (hosting, EU region).',
          'Professional advisers such as accountants and lawyers, where necessary.',
          'Public authorities, regulators and courts, where required by law or to establish, exercise or defend legal claims.',
        ],
        p2: 'All processors are bound by written data-processing agreements that meet Article 28 GDPR. We do not sell your personal data.',
      },
      {
        h: '9. International Data Transfers',
        p: 'Where personal data is transferred outside the European Economic Area (EEA), we ensure an appropriate safeguard under Chapter V GDPR is in place. Depending on the destination, this may include:',
        list: [
          'An adequacy decision of the European Commission (Art. 45 GDPR).',
          'The European Commission\'s Standard Contractual Clauses (2021 version) together with any supplementary measures identified in a transfer impact assessment (Art. 46 GDPR).',
        ],
        p2: 'You may request a copy of the relevant safeguard by contacting us at info@cybratech-solutions.com.',
      },
      {
        h: '10. Data Retention',
        sub: 'We keep personal data only for as long as necessary, then delete or anonymise it:',
        list: [
          'User account & profile data: Duration of membership plus up to 5 years after closure — for defence of legal claims / limitation periods.',
          'Contractual records: Up to 10 years — statutory retention.',
          'Financial & tax records: As required by applicable tax law — legal obligation.',
          'Verification documents: Until account closure, then for any applicable statutory retention period — legal obligation / claims defence.',
          'Support & communications: Up to the limitation period for related claims — legitimate interests / claims defence.',
        ],
      },
      {
        h: '11. Your Rights Under GDPR',
        sub: 'You have the right to:',
        list: [
          'Access your personal data and obtain a copy (Art. 15).',
          'Rectify inaccurate or incomplete data (Art. 16).',
          'Erase your data ("right to be forgotten"), where applicable (Art. 17).',
          'Restrict processing in certain circumstances (Art. 18).',
          'Object to processing based on legitimate interests, and to direct marketing at any time (Art. 21).',
          'Data portability — receive your data in a structured, machine-readable format (Art. 20).',
          'Withdraw consent at any time where processing is based on consent, without affecting prior processing (Art. 7(3)).',
        ],
        note: 'To exercise your rights, contact: info@cybratech-solutions.com. We will respond within one month. We may need to verify your identity before acting on a request.',
      },
      {
        h: '12. Automated Decision-Making',
        p: 'PDR Connect does not make decisions producing legal or similarly significant effects about you based solely on automated processing within the meaning of Article 22 GDPR. If this changes, we will update this Policy and inform you of the logic involved and the significance and consequences of such processing.',
      },
      {
        h: '13. How We Protect Your Data',
        p: 'We implement appropriate technical and organisational measures under Article 32 GDPR to protect personal data against unauthorised access, loss or alteration:',
        list: [
          'SSL/TLS encryption in transit.',
          'Secured servers with access controls.',
          'Authentication procedures and regular security monitoring.',
          'Backups and disaster recovery procedures.',
        ],
        p2: 'In the event of a personal data breach likely to result in risk to your rights, we will notify the competent authority within 72 hours and affected individuals without undue delay where the risk is high.',
      },
      {
        h: '14. Cookies and Similar Technologies',
        p: 'PDR Connect uses cookies that are strictly necessary for the Platform to function. Non-essential cookies — such as analytics or marketing cookies — are used only with your prior consent, which you can give or withdraw at any time through our cookie banner or settings.',
        p2: 'Details of the cookies we use, their providers, purposes and durations are set out in our separate Cookie Policy.',
      },
      {
        h: '15. Your Right to Lodge a Complaint',
        p: 'If you have concerns about how we handle your personal data, please contact us first. You also have the right to lodge a complaint with a supervisory authority:',
        list: [
          'Cyprus: Office of the Commissioner for Personal Data Protection — www.dataprotection.gov.cy — Nicosia, Cyprus.',
          'You may also complain to the supervisory authority in your EU/EEA country of residence or place of the alleged infringement.',
        ],
      },
      {
        h: '16. Changes to This Privacy Policy',
        p: 'We may update this Privacy Policy from time to time. Where changes are material, we will notify you through the Platform or by email before they take effect. The "Effective date" at the top shows when the Policy was last revised.',
      },
      {
        h: '17. Contact Us',
        p: 'For any questions about this Privacy Policy or your personal data:\nCybratech Solutions Ltd.\nEfesou 9, 5280 Paralimni, Republic of Cyprus\nEmail: info@cybratech-solutions.com\nWebsite: pdrconnect.eu',
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     DEUTSCH  (DE)
  ══════════════════════════════════════════════════════════════════ */
  de: {
    title: 'Datenschutzerklärung',
    subtitle: 'PDR Connect · Cybratech Solutions Ltd. · Stand: 02. Juni 2026',
    intro: 'Diese Datenschutzerklärung erläutert, wie Cybratech Solutions Ltd. („wir", „uns", „unser"), Betreiber der PDR Connect Plattform, personenbezogene Daten erhebt, verwendet, weitergibt und schützt sowie welche Rechte Sie bezüglich Ihrer personenbezogenen Daten haben. Sie gilt für Kunden, Techniker, Auftragnehmer sowie alle sonstigen Besucher und Nutzer der Plattform. Für die Zwecke der Verordnung (EU) 2016/679 (DSGVO) und des zypriotischen Gesetzes zum Schutz natürlicher Personen bei der Verarbeitung personenbezogener Daten, Gesetz 125(I)/2018, ist Cybratech Solutions Ltd. der Verantwortliche für die in dieser Erklärung beschriebenen Verarbeitungen.',
    sections: [
      {
        h: '1. Wer wir sind (Verantwortlicher)',
        list: [
          'Verantwortlicher: Cybratech Solutions Ltd.',
          'Sitz: Efesou 9, 5280 Paralimni, Republik Zypern',
          'USt-IdNr.: CY60015676H',
          'Allgemeiner Kontakt: info@cybratech-solutions.com',
          'Website: pdrconnect.eu',
          'Datenschutzbeauftragter / Datenschutzkontakt: DPCA Audit Tax Advisory - D. PAPADEMETRIOU LTD.',
          'EU/EWR-Vertreter: Nicht erforderlich — der Verantwortliche ist in der EU ansässig.',
        ],
      },
      {
        h: '2. Unsere Rolle auf einer zweiseitigen Plattform',
        p: 'PDR Connect ist ein Marktplatz, der Techniker mit Kunden verbindet. Mehr als eine Partei kann Ihre personenbezogenen Daten in unterschiedlichen Rollen verarbeiten:',
        list: [
          'Wir handeln als Verantwortlicher, wenn wir die Plattform betreiben — z. B. beim Erstellen und Verwalten von Konten, der Überprüfung beruflicher Identitäten, der Zahlungsabwicklung, der Bereitstellung von Support und der Sicherung des Dienstes.',
          'Plattformmitglieder handeln als eigenständige Verantwortliche für die personenbezogenen Daten, die sie übereinander erhalten, um einen Auftrag auszuführen (z. B. ein Kunde und ein Techniker, die vereinbaren, zusammenzuarbeiten). Jedes Mitglied ist für seine eigene Nutzung dieser Daten verantwortlich.',
          'Wo wir gemeinsam mit einer anderen Partei die Zwecke und Mittel einer bestimmten Verarbeitungstätigkeit festlegen, schließen wir eine Vereinbarung gemeinsamer Verantwortlichkeit gemäß Art. 26 DSGVO.',
        ],
      },
      {
        h: '3. Personenbezogene Daten, die wir erheben',
        sub: 'Wir erheben und verarbeiten folgende Kategorien personenbezogener Daten:',
        list: [
          'Kontodaten: Vollständiger Name; E-Mail-Adresse; Telefonnummer; Land des Wohnsitzes; Berufsrolle.',
          'Profilinformationen: Biografie; Fähigkeiten und Qualifikationen; Zertifizierungen; angebotene Dienstleistungen; Profilfoto.',
          'Verifizierungsdokumente: Ausweisdokumente; A1-Bescheinigungen; Berufslizenzen; Reise- und Arbeitserlaubnisse. (Siehe §6 zu besonderen Kategorien.)',
          'Technische Daten: IP-Adresse; Browsertyp und -version; Geräteinformationen; Anmeldeprotokolle; Sitzungsinformationen.',
          'Kommunikationsdaten: Über die Plattform ausgetauschte Nachrichten; Support-Anfragen; vertragliche Korrespondenz.',
        ],
      },
      {
        h: '4. Woher wir Ihre Daten erhalten',
        p: 'Die meisten personenbezogenen Daten werden direkt von Ihnen bereitgestellt, wenn Sie sich registrieren, Ihr Profil aufbauen, Verifizierungsdokumente hochladen oder über die Plattform kommunizieren. In einigen Fällen erhalten wir personenbezogene Daten aus anderen Quellen:',
        list: [
          'Andere Plattformmitglieder, wenn sie Informationen über Sie im Zusammenhang mit einem Auftrag teilen.',
          'Anbieter von Identitätsprüfungs-, Betrugsbekämpfungs- und Zahlungsdiensten, die die von Ihnen bereitgestellten Informationen bestätigen oder ergänzen.',
          'Öffentliche Register und zuständige Behörden, soweit dies rechtmäßig und für Verifizierungs- oder Compliance-Zwecke notwendig ist.',
        ],
      },
      {
        h: '5. Zwecke und Rechtsgrundlagen der Verarbeitung',
        sub: 'Wir verarbeiten personenbezogene Daten nur, wenn wir eine Rechtsgrundlage gemäß Art. 6 DSGVO haben:',
        list: [
          'Kontoerstellung & Plattformzugang — Registrierung und Authentifizierung von Nutzern; Profilverwaltung. Rechtsgrundlage: Vertragserfüllung (Art. 6 Abs. 1 lit. b).',
          'Matching & Aufträge — Verbindung von Technikern und Kunden; Ermöglichung der Kommunikation. Rechtsgrundlage: Vertragserfüllung (Art. 6 Abs. 1 lit. b).',
          'Zahlungen & Rechnungsstellung — Zahlungsabwicklung, Auszahlungen und Vertragsverwaltung. Rechtsgrundlage: Vertragserfüllung (Art. 6 Abs. 1 lit. b); rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c).',
          'Identitäts- & Qualifikationsverifizierung — Bestätigung der beruflichen Identität und Arbeitsberechtigung. Rechtsgrundlage: Rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c) und/oder berechtigte Interessen (Art. 6 Abs. 1 lit. f).',
          'Steuer-, Buchhaltungs- & Aufzeichnungspflichten — Erfüllung gesetzlicher Finanzpflichten. Rechtsgrundlage: Rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c).',
          'Betrugsprävention & Plattformsicherheit — Verhinderung von Missbrauch; Überwachung auf Sicherheitsbedrohungen. Rechtsgrundlage: Berechtigte Interessen (Art. 6 Abs. 1 lit. f).',
          'Serviceverbesserung & Betrieb — Wartung und Verbesserung der Plattform. Rechtsgrundlage: Berechtigte Interessen (Art. 6 Abs. 1 lit. f).',
          'Kundensupport — Beantwortung von Anfragen und Lösung von Problemen. Rechtsgrundlage: Vertragserfüllung (Art. 6 Abs. 1 lit. b); berechtigte Interessen (Art. 6 Abs. 1 lit. f).',
          'Optionale Cookies / Analysen / Marketing. Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a).',
        ],
        note: 'Soweit wir uns auf berechtigte Interessen stützen, haben wir eine Interessenabwägung durchgeführt. Sie können weitere Informationen anfordern und haben das Recht auf Widerspruch (siehe §11).',
      },
      {
        h: '6. Besondere Kategorien und sensible Daten',
        p: 'Einige Verifizierungsdokumente können Daten enthalten oder Rückschlüsse auf Daten ermöglichen, die unter die besonderen Kategorien gemäß Art. 9 DSGVO fallen. Wo wir solche Daten verarbeiten, stützen wir uns auf:',
        list: [
          'Verarbeitung, die zur Erfüllung von Pflichten und zur Wahrnehmung besonderer Rechte im Bereich des Arbeitsrechts, der sozialen Sicherheit und des Sozialschutzes erforderlich ist — Art. 9 Abs. 2 lit. b.',
          'Ihre ausdrückliche Einwilligung, wo erforderlich — Art. 9 Abs. 2 lit. a.',
        ],
        p2: 'Wir wenden auf diese Daten verstärkte Schutzmaßnahmen an, einschließlich Zugriffsbeschränkungen, Verschlüsselung und minimierter Speicherung.',
      },
      {
        h: '7. Ob die Datenbereitstellung erforderlich ist',
        p: 'Die Bereitstellung von Konto-, Profil- und Verifizierungsdaten ist erforderlich, um ein Konto zu erstellen und die Plattform zu nutzen. Wenn Sie die für die Registrierung, Identitätsverifizierung oder Zahlung erforderlichen Daten nicht bereitstellen, können wir die entsprechenden Dienste nicht erbringen.',
        p2: 'Wo die Verarbeitung auf einer Einwilligung basiert (z. B. optionale Cookies), ist die Bereitstellung freiwillig und Sie können die Einwilligung jederzeit widerrufen, ohne dass der Zugang zu Kerndiensten beeinträchtigt wird.',
      },
      {
        h: '8. Empfänger und Datenweitergabe',
        sub: 'Wir geben personenbezogene Daten nur soweit erforderlich an folgende Empfängerkategorien weiter:',
        list: [
          'Andere verifizierte Plattformmitglieder, soweit dies zur Vereinbarung und Durchführung von Aufträgen erforderlich ist.',
          'Dienstleister als unsere Auftragsverarbeiter, darunter: Stripe Inc. (Zahlungen), Supabase Inc. (Datenbank/Speicher, EU-Region), Resend Inc. (E-Mail-Zustellung), Vercel Inc. (Hosting, EU-Region).',
          'Berufsberater wie Buchhalter und Rechtsanwälte, soweit erforderlich.',
          'Behörden, Aufsichtsbehörden und Gerichte, soweit gesetzlich vorgeschrieben oder zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich.',
        ],
        p2: 'Alle Auftragsverarbeiter sind durch schriftliche Datenverarbeitungsverträge gemäß Art. 28 DSGVO gebunden. Wir verkaufen Ihre personenbezogenen Daten nicht.',
      },
      {
        h: '9. Internationale Datenübermittlungen',
        p: 'Wenn personenbezogene Daten außerhalb des Europäischen Wirtschaftsraums (EWR) übermittelt werden, stellen wir sicher, dass eine geeignete Garantie gemäß Kapitel V DSGVO vorhanden ist:',
        list: [
          'Ein Angemessenheitsbeschluss der Europäischen Kommission (Art. 45 DSGVO).',
          'Die Standardvertragsklauseln der Europäischen Kommission (Version 2021) zusammen mit etwaigen ergänzenden Maßnahmen aus einer Transferfolgenabschätzung (Art. 46 DSGVO).',
        ],
        p2: 'Sie können eine Kopie der relevanten Garantie anfordern unter: info@cybratech-solutions.com.',
      },
      {
        h: '10. Datenspeicherung',
        sub: 'Wir speichern personenbezogene Daten nur so lange, wie es erforderlich ist, dann löschen oder anonymisieren wir sie:',
        list: [
          'Konto- & Profildaten: Für die Dauer der Mitgliedschaft plus bis zu 5 Jahre nach Schließung — zur Verteidigung von Rechtsansprüchen / Verjährungsfristen.',
          'Vertragliche Aufzeichnungen: Bis zu 10 Jahre — gesetzliche Aufbewahrungspflicht.',
          'Finanz- & Steuerdaten: Gemäß anwendbarem Steuerrecht — rechtliche Verpflichtung.',
          'Verifizierungsdokumente: Bis zur Kontoschließung, danach für etwaige gesetzliche Aufbewahrungsfristen — rechtliche Verpflichtung / Rechtsansprüche.',
          'Support & Kommunikation: Bis zur Verjährungsfrist für zusammenhängende Ansprüche — berechtigte Interessen / Rechtsansprüche.',
        ],
      },
      {
        h: '11. Ihre Rechte nach der DSGVO',
        sub: 'Sie haben das Recht auf:',
        list: [
          'Auskunft über Ihre personenbezogenen Daten und Erhalt einer Kopie (Art. 15).',
          'Berichtigung unrichtiger oder unvollständiger Daten (Art. 16).',
          'Löschung Ihrer Daten („Recht auf Vergessenwerden"), sofern anwendbar (Art. 17).',
          'Einschränkung der Verarbeitung unter bestimmten Umständen (Art. 18).',
          'Widerspruch gegen die Verarbeitung auf Basis berechtigter Interessen sowie gegen Direktwerbung jederzeit (Art. 21).',
          'Datenübertragbarkeit — Erhalt Ihrer Daten in einem strukturierten, gängigen, maschinenlesbaren Format (Art. 20).',
          'Widerruf der Einwilligung jederzeit, soweit die Verarbeitung auf einer Einwilligung beruht, ohne Auswirkung auf die vorherige Verarbeitung (Art. 7 Abs. 3).',
        ],
        note: 'Zur Ausübung Ihrer Rechte wenden Sie sich an: info@cybratech-solutions.com. Wir antworten innerhalb eines Monats. Zur Bearbeitung Ihrer Anfrage müssen wir ggf. Ihre Identität überprüfen.',
      },
      {
        h: '12. Automatisierte Entscheidungsfindung',
        p: 'PDR Connect trifft keine Entscheidungen, die rechtliche oder ähnlich erhebliche Auswirkungen auf Sie haben, allein auf der Grundlage automatisierter Verarbeitung im Sinne von Art. 22 DSGVO. Sollte sich dies ändern, werden wir diese Erklärung aktualisieren und Sie über die involvierte Logik sowie die Bedeutung und Konsequenzen informieren.',
      },
      {
        h: '13. Wie wir Ihre Daten schützen',
        p: 'Wir implementieren geeignete technische und organisatorische Maßnahmen gemäß Art. 32 DSGVO zum Schutz personenbezogener Daten vor unbefugtem Zugriff, Verlust oder Veränderung:',
        list: [
          'SSL/TLS-Verschlüsselung bei der Übertragung.',
          'Gesicherte Server mit Zugriffskontrollen.',
          'Authentifizierungsverfahren und regelmäßige Sicherheitsüberwachung.',
          'Backups und Notfallwiederherstellungsverfahren.',
        ],
        p2: 'Im Falle einer Datenpanne, die voraussichtlich zu einem Risiko für Ihre Rechte führt, benachrichtigen wir die zuständige Behörde innerhalb von 72 Stunden und betroffene Personen unverzüglich, wenn das Risiko hoch ist.',
      },
      {
        h: '14. Cookies und ähnliche Technologien',
        p: 'PDR Connect verwendet Cookies, die für das Funktionieren der Plattform unbedingt erforderlich sind. Nicht wesentliche Cookies — wie Analyse- oder Marketing-Cookies — werden nur mit Ihrer vorherigen Einwilligung verwendet, die Sie jederzeit über unser Cookie-Banner oder die Einstellungen erteilen oder widerrufen können.',
        p2: 'Einzelheiten zu den von uns verwendeten Cookies, deren Anbieter, Zwecke und Laufzeiten sind in unserer gesonderten Cookie-Richtlinie aufgeführt.',
      },
      {
        h: '15. Ihr Recht auf Beschwerde bei einer Aufsichtsbehörde',
        p: 'Wenn Sie Bedenken hinsichtlich unseres Umgangs mit Ihren personenbezogenen Daten haben, wenden Sie sich bitte zunächst an uns. Sie haben auch das Recht, eine Beschwerde bei einer Aufsichtsbehörde einzureichen:',
        list: [
          'Zypern: Beauftragter für den Schutz personenbezogener Daten (Commissioner for Personal Data Protection) — www.dataprotection.gov.cy — Nikosia, Zypern.',
          'Sie können sich auch an die Aufsichtsbehörde Ihres EU/EWR-Wohnsitzlandes oder des Ortes des mutmaßlichen Verstoßes wenden.',
        ],
      },
      {
        h: '16. Änderungen dieser Datenschutzerklärung',
        p: 'Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Bei wesentlichen Änderungen werden wir Sie über die Plattform oder per E-Mail benachrichtigen, bevor diese in Kraft treten. Das Datum „Stand" oben zeigt an, wann die Erklärung zuletzt überarbeitet wurde.',
      },
      {
        h: '17. Kontakt',
        p: 'Bei Fragen zu dieser Datenschutzerklärung oder Ihren personenbezogenen Daten:\nCybratech Solutions Ltd.\nEfesou 9, 5280 Paralimni, Republik Zypern\nE-Mail: info@cybratech-solutions.com\nWebsite: pdrconnect.eu',
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     ESPAÑOL  (ES)
  ══════════════════════════════════════════════════════════════════ */
  es: {
    title: 'Política de Privacidad',
    subtitle: 'PDR Connect · Cybratech Solutions Ltd. · Fecha de entrada en vigor: 02 de junio de 2026',
    intro: 'Esta Política de Privacidad explica cómo Cybratech Solutions Ltd. ("nosotros", "nos", "nuestro"), operador de la plataforma PDR Connect, recopila, usa, comparte y protege los datos personales, así como los derechos que usted tiene sobre sus datos. Se aplica a clientes, técnicos, contratistas y otros visitantes y usuarios de la Plataforma. A efectos del Reglamento General de Protección de Datos de la UE (UE) 2016/679 ("RGPD") y de la Ley de Chipre sobre Protección de Personas Físicas en el Tratamiento de Datos Personales, Ley 125(I)/2018, Cybratech Solutions Ltd. es el responsable del tratamiento descrito en esta Política.',
    sections: [
      {
        h: '1. Quiénes somos (Responsable del tratamiento)',
        list: [
          'Responsable: Cybratech Solutions Ltd.',
          'Domicilio social: Efesou 9, 5280 Paralimni, República de Chipre',
          'NIF/CIF: CY60015676H',
          'Contacto general: info@cybratech-solutions.com',
          'Web: pdrconnect.eu',
          'Delegado de Protección de Datos / contacto de privacidad: DPCA Audit Tax Advisory - D. PAPADEMETRIOU LTD.',
          'Representante en la UE/EEE: No requerido — el responsable está establecido en la UE.',
        ],
      },
      {
        h: '2. Nuestro papel en una plataforma de dos lados',
        p: 'PDR Connect es un mercado que conecta técnicos con clientes. Más de una parte puede manejar sus datos personales en diferentes roles:',
        list: [
          'Actuamos como responsables cuando operamos la Plataforma — por ejemplo, al crear y gestionar cuentas, verificar identidades profesionales, procesar pagos, brindar soporte y asegurar el servicio.',
          'Los miembros de la Plataforma actúan como responsables independientes respecto a los datos personales que reciben unos de otros para realizar un encargo. Cada miembro es responsable de su propio uso de esos datos.',
          'Donde nosotros y otra parte determinamos conjuntamente los fines y medios de una actividad de tratamiento específica, estableceremos un acuerdo de responsabilidad conjunta conforme al Artículo 26 del RGPD.',
        ],
      },
      {
        h: '3. Datos personales que recopilamos',
        sub: 'Recopilamos y tratamos las siguientes categorías de datos personales:',
        list: [
          'Datos de cuenta: Nombre completo; dirección de email; número de teléfono; país de residencia; rol profesional.',
          'Información de perfil: Biografía; habilidades y cualificaciones; certificaciones; servicios ofrecidos; foto de perfil.',
          'Documentos de verificación: Documentos de identidad; certificados A1; licencias profesionales; documentos de viaje y autorización de trabajo. (Ver §6 sobre datos de categoría especial.)',
          'Datos técnicos: Dirección IP; tipo y versión de navegador; información del dispositivo; registros de inicio de sesión; información de sesión.',
          'Datos de comunicación: Mensajes intercambiados a través de la Plataforma; solicitudes de soporte; comunicaciones contractuales.',
        ],
      },
      {
        h: '4. Dónde obtenemos sus datos',
        p: 'La mayoría de los datos personales son proporcionados directamente por usted cuando se registra, crea su perfil, sube documentos de verificación o se comunica a través de la Plataforma. En algunos casos recibimos datos de otras fuentes:',
        list: [
          'Otros miembros de la Plataforma, cuando comparten información sobre usted en conexión con un encargo.',
          'Proveedores de verificación de identidad, antifraude y pagos que confirman o complementan la información que usted proporciona.',
          'Registros públicos y autoridades competentes, cuando sea lícito y necesario para verificación o cumplimiento normativo.',
        ],
      },
      {
        h: '5. Fines y bases jurídicas del tratamiento',
        sub: 'Tratamos datos personales únicamente cuando contamos con una base jurídica conforme al Artículo 6 del RGPD:',
        list: [
          'Creación de cuenta y acceso a la plataforma — Registro y autenticación de usuarios; gestión de perfiles. Base jurídica: Ejecución del contrato (Art. 6(1)(b)).',
          'Matching y encargos — Conexión de técnicos y clientes; habilitación de comunicación. Base jurídica: Ejecución del contrato (Art. 6(1)(b)).',
          'Pagos y facturación — Procesamiento de pagos, cobros y administración contractual. Base jurídica: Ejecución del contrato (Art. 6(1)(b)); obligación legal (Art. 6(1)(c)).',
          'Verificación de identidad y cualificaciones — Confirmación de identidad profesional y derecho al trabajo. Base jurídica: Obligación legal (Art. 6(1)(c)) y/o intereses legítimos (Art. 6(1)(f)).',
          'Impuestos, contabilidad y conservación de registros — Cumplimiento de obligaciones financieras legales. Base jurídica: Obligación legal (Art. 6(1)(c)).',
          'Prevención del fraude y seguridad de la plataforma — Prevención de abusos; monitoreo de amenazas de seguridad. Base jurídica: Intereses legítimos (Art. 6(1)(f)).',
          'Mejora del servicio y operaciones — Mantenimiento y mejora de la Plataforma. Base jurídica: Intereses legítimos (Art. 6(1)(f)).',
          'Atención al cliente — Respuesta a solicitudes y resolución de problemas. Base jurídica: Ejecución del contrato (Art. 6(1)(b)); intereses legítimos (Art. 6(1)(f)).',
          'Cookies opcionales / análisis / marketing. Base jurídica: Consentimiento (Art. 6(1)(a)).',
        ],
        note: 'Cuando nos basamos en intereses legítimos, hemos realizado una prueba de ponderación. Puede solicitar más información y tiene derecho de oposición (ver §11).',
      },
      {
        h: '6. Datos de categorías especiales y datos sensibles',
        p: 'Algunos documentos de verificación pueden contener, o permitir inferencias sobre, datos que entran en las categorías especiales conforme al Artículo 9 del RGPD. Cuando tratamos dichos datos, nos basamos en:',
        list: [
          'Tratamiento necesario para cumplir obligaciones y ejercer derechos específicos en el ámbito del derecho laboral, seguridad social y protección social — Art. 9(2)(b).',
          'Su consentimiento explícito, cuando sea requerido — Art. 9(2)(a).',
        ],
        p2: 'Aplicamos salvaguardas reforzadas a estos datos, incluyendo restricciones de acceso, cifrado y retención minimizada.',
      },
      {
        h: '7. Si proporcionar datos es obligatorio',
        p: 'Proporcionar datos de cuenta, perfil y verificación es necesario para crear una cuenta y utilizar la Plataforma. Si no proporciona los datos necesarios para el registro, la verificación de identidad o el pago, no podremos prestar los servicios relevantes.',
        p2: 'Cuando el tratamiento se basa en el consentimiento (p. ej., cookies opcionales), el suministro es voluntario y puede retirar el consentimiento en cualquier momento sin afectar el acceso a los servicios principales.',
      },
      {
        h: '8. Destinatarios y transferencias de datos',
        sub: 'Compartimos datos personales solo en la medida necesaria con las siguientes categorías de destinatarios:',
        list: [
          'Otros miembros verificados de la Plataforma, cuando sea necesario para organizar y realizar encargos.',
          'Proveedores de servicios que actúan como nuestros encargados del tratamiento, incluyendo: Stripe Inc. (pagos), Supabase Inc. (base de datos/almacenamiento, región UE), Resend Inc. (entrega de email), Vercel Inc. (hosting, región UE).',
          'Asesores profesionales como contables y abogados, cuando sea necesario.',
          'Autoridades públicas, reguladores y tribunales, cuando lo exija la ley o para ejercer o defender reclamaciones legales.',
        ],
        p2: 'Todos los encargados están vinculados por acuerdos escritos de tratamiento de datos que cumplen con el Artículo 28 del RGPD. No vendemos sus datos personales.',
      },
      {
        h: '9. Transferencias internacionales de datos',
        p: 'Cuando se transfieren datos personales fuera del Espacio Económico Europeo (EEE), nos aseguramos de que existan garantías adecuadas conforme al Capítulo V del RGPD:',
        list: [
          'Una decisión de adecuación de la Comisión Europea (Art. 45 RGPD).',
          'Las Cláusulas Contractuales Tipo de la Comisión Europea (versión 2021) junto con las medidas suplementarias identificadas en una evaluación de impacto de la transferencia (Art. 46 RGPD).',
        ],
        p2: 'Puede solicitar una copia de la garantía aplicable contactándonos en info@cybratech-solutions.com.',
      },
      {
        h: '10. Conservación de datos',
        sub: 'Conservamos los datos personales solo durante el tiempo necesario, luego los eliminamos o anonimizamos:',
        list: [
          'Datos de cuenta y perfil: Duración de la membresía más hasta 5 años tras el cierre — para defensa de reclamaciones legales / períodos de prescripción.',
          'Registros contractuales: Hasta 10 años — retención legal.',
          'Registros financieros y fiscales: Según la legislación fiscal aplicable — obligación legal.',
          'Documentos de verificación: Hasta el cierre de la cuenta, luego durante cualquier período de retención legal aplicable — obligación legal / defensa de reclamaciones.',
          'Soporte y comunicaciones: Hasta el período de prescripción de reclamaciones relacionadas — intereses legítimos / defensa de reclamaciones.',
        ],
      },
      {
        h: '11. Sus derechos bajo el RGPD',
        sub: 'Tiene derecho a:',
        list: [
          'Acceder a sus datos personales y obtener una copia (Art. 15).',
          'Rectificar datos inexactos o incompletos (Art. 16).',
          'Suprimir sus datos ("derecho al olvido"), cuando aplique (Art. 17).',
          'Limitar el tratamiento en determinadas circunstancias (Art. 18).',
          'Oponerse al tratamiento basado en intereses legítimos y a la mercadotecnia directa en cualquier momento (Art. 21).',
          'Portabilidad de datos — recibir sus datos en un formato estructurado, de uso común y legible por máquina (Art. 20).',
          'Retirar el consentimiento en cualquier momento donde el tratamiento se base en el consentimiento, sin afectar el tratamiento previo (Art. 7(3)).',
        ],
        note: 'Para ejercer sus derechos, contacte: info@cybratech-solutions.com. Responderemos en un mes. Es posible que necesitemos verificar su identidad antes de atender su solicitud.',
      },
      {
        h: '12. Toma de decisiones automatizada',
        p: 'PDR Connect no toma decisiones que produzcan efectos jurídicos o igualmente significativos sobre usted basadas únicamente en el tratamiento automatizado en el sentido del Artículo 22 del RGPD. Si esto cambia, actualizaremos esta Política e informaremos sobre la lógica implicada y la importancia y consecuencias de dicho tratamiento.',
      },
      {
        h: '13. Cómo protegemos sus datos',
        p: 'Implementamos medidas técnicas y organizativas apropiadas conforme al Artículo 32 del RGPD para proteger los datos personales contra el acceso no autorizado, pérdida o alteración:',
        list: [
          'Cifrado SSL/TLS en tránsito.',
          'Servidores seguros con controles de acceso.',
          'Procedimientos de autenticación y monitoreo regular de seguridad.',
          'Copias de seguridad y procedimientos de recuperación ante desastres.',
        ],
        p2: 'En caso de violación de datos personales que probablemente entrañe un riesgo para sus derechos, notificaremos a la autoridad competente en 72 horas y a los afectados sin dilación indebida cuando el riesgo sea alto.',
      },
      {
        h: '14. Cookies y tecnologías similares',
        p: 'PDR Connect utiliza cookies estrictamente necesarias para el funcionamiento de la Plataforma. Las cookies no esenciales — como las de análisis o marketing — se usan únicamente con su consentimiento previo, que puede dar o retirar en cualquier momento a través de nuestro banner de cookies o ajustes.',
        p2: 'Los detalles sobre las cookies que utilizamos, sus proveedores, propósitos y duraciones se recogen en nuestra Política de Cookies independiente.',
      },
      {
        h: '15. Su derecho a presentar una reclamación',
        p: 'Si tiene dudas sobre cómo manejamos sus datos personales, contacte con nosotros primero. También tiene derecho a presentar una reclamación ante una autoridad de control:',
        list: [
          'Chipre: Oficina del Comisionado para la Protección de Datos Personales — www.dataprotection.gov.cy — Nicosia, Chipre.',
          'También puede reclamar ante la autoridad supervisora de su país de residencia en la UE/EEE o del lugar de la supuesta infracción.',
        ],
      },
      {
        h: '16. Cambios en esta Política de Privacidad',
        p: 'Podemos actualizar esta Política de Privacidad de vez en cuando. Cuando los cambios sean materiales, le notificaremos a través de la Plataforma o por email antes de que entren en vigor. La "Fecha de entrada en vigor" en la parte superior indica cuándo se revisó por última vez la Política.',
      },
      {
        h: '17. Contáctenos',
        p: 'Para cualquier pregunta sobre esta Política de Privacidad o sus datos personales:\nCybratech Solutions Ltd.\nEfesou 9, 5280 Paralimni, República de Chipre\nCorreo: info@cybratech-solutions.com\nWeb: pdrconnect.eu',
      },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
     ΕΛΛΗΝΙΚΑ  (EL)
  ══════════════════════════════════════════════════════════════════ */
  el: {
    title: 'Πολιτική Απορρήτου',
    subtitle: 'PDR Connect · Cybratech Solutions Ltd. · Ημερομηνία έναρξης ισχύος: 02 Ιουνίου 2026',
    intro: 'Η παρούσα Πολιτική Απορρήτου εξηγεί πώς η Cybratech Solutions Ltd. ("εμείς", "μας", "ημών"), ο διαχειριστής της πλατφόρμας PDR Connect, συλλέγει, χρησιμοποιεί, κοινοποιεί και προστατεύει τα προσωπικά δεδομένα, καθώς και τα δικαιώματά σας επ\' αυτών. Εφαρμόζεται σε πελάτες, τεχνικούς, εργολάβους και λοιπούς επισκέπτες και χρήστες της Πλατφόρμας. Για τους σκοπούς του Γενικού Κανονισμού Προστασίας Δεδομένων της ΕΕ (ΕΕ) 2016/679 ("ΓΚΠΔ") και του Κυπριακού Νόμου για την Προστασία Φυσικών Προσώπων έναντι της Επεξεργασίας Δεδομένων Προσωπικού Χαρακτήρα, Νόμος 125(Ι)/2018, η Cybratech Solutions Ltd. είναι ο υπεύθυνος επεξεργασίας.',
    sections: [
      {
        h: '1. Ποιοι είμαστε (Υπεύθυνος Επεξεργασίας)',
        list: [
          'Υπεύθυνος επεξεργασίας: Cybratech Solutions Ltd.',
          'Έδρα: Efesou 9, 5280 Παραλίμνι, Κυπριακή Δημοκρατία',
          'Αριθμός ΦΠΑ: CY60015676H',
          'Γενική επικοινωνία: info@cybratech-solutions.com',
          'Ιστότοπος: pdrconnect.eu',
          'Υπεύθυνος Προστασίας Δεδομένων / επαφή απορρήτου: DPCA Audit Tax Advisory - D. PAPADEMETRIOU LTD.',
          'Εκπρόσωπος ΕΕ/ΕΟΧ: Δεν απαιτείται — ο υπεύθυνος επεξεργασίας είναι εγκατεστημένος στην ΕΕ.',
        ],
      },
      {
        h: '2. Ο ρόλος μας σε μια αμφίπλευρη πλατφόρμα',
        p: 'Το PDR Connect είναι μια αγορά που συνδέει τεχνικούς με πελάτες. Περισσότερα από ένα μέρη μπορούν να χειρίζονται τα προσωπικά σας δεδομένα σε διαφορετικούς ρόλους:',
        list: [
          'Ενεργούμε ως υπεύθυνος επεξεργασίας όταν λειτουργούμε την Πλατφόρμα — π.χ. κατά τη δημιουργία και διαχείριση λογαριασμών, επαλήθευση επαγγελματικών ταυτοτήτων, επεξεργασία πληρωμών, παροχή υποστήριξης και ασφάλεια της υπηρεσίας.',
          'Τα μέλη της Πλατφόρμας ενεργούν ως ανεξάρτητοι υπεύθυνοι επεξεργασίας για τα προσωπικά δεδομένα που λαμβάνουν από άλλα μέλη για την εκτέλεση μιας ανάθεσης. Κάθε μέλος ευθύνεται για τη δική του χρήση αυτών των δεδομένων.',
          'Όπου εμείς και άλλο μέρος καθορίζουμε από κοινού τους σκοπούς και τα μέσα μιας συγκεκριμένης δραστηριότητας επεξεργασίας, θα συνάψουμε ρύθμιση από κοινού υπεύθυνων επεξεργασίας κατά το Άρθρο 26 ΓΚΠΔ.',
        ],
      },
      {
        h: '3. Προσωπικά δεδομένα που συλλέγουμε',
        sub: 'Συλλέγουμε και επεξεργαζόμαστε τις ακόλουθες κατηγορίες προσωπικών δεδομένων:',
        list: [
          'Στοιχεία λογαριασμού: Πλήρες ονοματεπώνυμο· διεύθυνση email· αριθμός τηλεφώνου· χώρα διαμονής· επαγγελματικός ρόλος.',
          'Πληροφορίες προφίλ: Βιογραφικό· δεξιότητες και προσόντα· πιστοποιητικά· προσφερόμενες υπηρεσίες· φωτογραφία προφίλ.',
          'Έγγραφα επαλήθευσης: Έγγραφα ταυτότητας· πιστοποιητικά Α1· επαγγελματικές άδειες· έγγραφα ταξιδίου και εργασιακής άδειας. (Βλ. §6 για ειδικές κατηγορίες.)',
          'Τεχνικά δεδομένα: Διεύθυνση IP· τύπος και έκδοση προγράμματος περιήγησης· πληροφορίες συσκευής· αρχεία σύνδεσης· πληροφορίες συνεδρίας.',
          'Δεδομένα επικοινωνίας: Μηνύματα που ανταλλάσσονται μέσω της Πλατφόρμας· αιτήματα υποστήριξης· συμβατική αλληλογραφία.',
        ],
      },
      {
        h: '4. Πού λαμβάνουμε τα δεδομένα σας',
        p: 'Τα περισσότερα προσωπικά δεδομένα παρέχονται απευθείας από εσάς κατά την εγγραφή, τη δημιουργία προφίλ, τη μεταφόρτωση εγγράφων επαλήθευσης ή την επικοινωνία μέσω της Πλατφόρμας. Σε ορισμένες περιπτώσεις λαμβάνουμε δεδομένα από άλλες πηγές:',
        list: [
          'Άλλα μέλη της Πλατφόρμας, όταν μοιράζονται πληροφορίες για εσάς σε σχέση με μια ανάθεση.',
          'Πάροχοι επαλήθευσης ταυτότητας, κατά της απάτης και πληρωμών που επιβεβαιώνουν ή συμπληρώνουν τις πληροφορίες που παρέχετε.',
          'Δημόσια μητρώα και αρμόδιες αρχές, όπου είναι νόμιμο και αναγκαίο για επαλήθευση ή συμμόρφωση.',
        ],
      },
      {
        h: '5. Σκοποί και νομικές βάσεις επεξεργασίας',
        sub: 'Επεξεργαζόμαστε προσωπικά δεδομένα μόνο όταν έχουμε νόμιμη βάση κατά το Άρθρο 6 ΓΚΠΔ:',
        list: [
          'Δημιουργία λογαριασμού και πρόσβαση στην πλατφόρμα — Εγγραφή και αυθεντικοποίηση χρηστών. Νομική βάση: Εκτέλεση σύμβασης (Άρθρ. 6(1)(β)).',
          'Matching και αναθέσεις — Σύνδεση τεχνικών και πελατών. Νομική βάση: Εκτέλεση σύμβασης (Άρθρ. 6(1)(β)).',
          'Πληρωμές και τιμολόγηση — Επεξεργασία πληρωμών και διαχείριση συμβολαίων. Νομική βάση: Εκτέλεση σύμβασης (Άρθρ. 6(1)(β))· νομική υποχρέωση (Άρθρ. 6(1)(γ)).',
          'Επαλήθευση ταυτότητας και προσόντων — Επιβεβαίωση επαγγελματικής ταυτότητας. Νομική βάση: Νομική υποχρέωση (Άρθρ. 6(1)(γ)) και/ή έννομα συμφέροντα (Άρθρ. 6(1)(στ)).',
          'Φορολογία, λογιστική και τήρηση αρχείων — Εκπλήρωση νομικών χρηματοοικονομικών υποχρεώσεων. Νομική βάση: Νομική υποχρέωση (Άρθρ. 6(1)(γ)).',
          'Πρόληψη απάτης και ασφάλεια πλατφόρμας — Αποτροπή κατάχρησης. Νομική βάση: Έννομα συμφέροντα (Άρθρ. 6(1)(στ)).',
          'Βελτίωση υπηρεσίας και λειτουργίες — Συντήρηση και βελτίωση της Πλατφόρμας. Νομική βάση: Έννομα συμφέροντα (Άρθρ. 6(1)(στ)).',
          'Υποστήριξη πελατών — Απάντηση σε αιτήματα. Νομική βάση: Εκτέλεση σύμβασης (Άρθρ. 6(1)(β))· έννομα συμφέροντα (Άρθρ. 6(1)(στ)).',
          'Προαιρετικά cookies / αναλυτικά / μάρκετινγκ. Νομική βάση: Συγκατάθεση (Άρθρ. 6(1)(α)).',
        ],
        note: 'Όπου βασιζόμαστε σε έννομα συμφέροντα, έχουμε διενεργήσει εξισορρόπηση συμφερόντων. Μπορείτε να ζητήσετε περισσότερες πληροφορίες και έχετε δικαίωμα εναντίωσης (βλ. §11).',
      },
      {
        h: '6. Ειδικές κατηγορίες και ευαίσθητα δεδομένα',
        p: 'Ορισμένα έγγραφα επαλήθευσης μπορεί να περιέχουν δεδομένα που εμπίπτουν στις ειδικές κατηγορίες του Άρθρου 9 ΓΚΠΔ. Όπου επεξεργαζόμαστε τέτοια δεδομένα, βασιζόμαστε σε:',
        list: [
          'Επεξεργασία αναγκαία για την εκπλήρωση υποχρεώσεων στον τομέα του εργατικού δικαίου, κοινωνικής ασφάλισης και κοινωνικής προστασίας — Άρθρ. 9(2)(β).',
          'Τη ρητή συγκατάθεσή σας, όπου απαιτείται — Άρθρ. 9(2)(α).',
        ],
        p2: 'Εφαρμόζουμε ενισχυμένες διασφαλίσεις σε αυτά τα δεδομένα, συμπεριλαμβανομένων περιορισμών πρόσβασης, κρυπτογράφησης και ελαχιστοποιημένης διατήρησης.',
      },
      {
        h: '7. Εάν η παροχή δεδομένων είναι απαραίτητη',
        p: 'Η παροχή στοιχείων λογαριασμού, προφίλ και επαλήθευσης είναι απαραίτητη για τη δημιουργία λογαριασμού και τη χρήση της Πλατφόρμας. Εάν δεν παρέχετε τα απαιτούμενα δεδομένα, δεν θα μπορούμε να παρέχουμε τις σχετικές υπηρεσίες.',
        p2: 'Όπου η επεξεργασία βασίζεται σε συγκατάθεση (π.χ. προαιρετικά cookies), η παροχή είναι εθελοντική και μπορείτε να ανακαλέσετε τη συγκατάθεσή σας ανά πάσα στιγμή χωρίς να επηρεαστεί η πρόσβαση στις βασικές υπηρεσίες.',
      },
      {
        h: '8. Αποδέκτες και κοινοποίηση δεδομένων',
        sub: 'Κοινοποιούμε προσωπικά δεδομένα μόνο στο αναγκαίο μέτρο στις ακόλουθες κατηγορίες αποδεκτών:',
        list: [
          'Άλλα επαληθευμένα μέλη της Πλατφόρμας, όπου αναγκαίο για τη διοργάνωση και εκτέλεση αναθέσεων.',
          'Πάροχοι υπηρεσιών που ενεργούν ως εκτελούντες επεξεργασία μας, συμπεριλαμβανομένων: Stripe Inc. (πληρωμές), Supabase Inc. (βάση δεδομένων/αποθήκευση, περιοχή ΕΕ), Resend Inc. (αποστολή email), Vercel Inc. (hosting, περιοχή ΕΕ).',
          'Επαγγελματικοί σύμβουλοι όπως λογιστές και δικηγόροι, όπου αναγκαίο.',
          'Δημόσιες αρχές, ρυθμιστικές αρχές και δικαστήρια, όπου απαιτείται από το νόμο ή για την άσκηση ή υπεράσπιση νομικών αξιώσεων.',
        ],
        p2: 'Όλοι οι εκτελούντες επεξεργασία δεσμεύονται από γραπτές συμβάσεις επεξεργασίας δεδομένων που πληρούν το Άρθρο 28 ΓΚΠΔ. Δεν πωλούμε τα προσωπικά σας δεδομένα.',
      },
      {
        h: '9. Διεθνείς διαβιβάσεις δεδομένων',
        p: 'Όπου τα προσωπικά δεδομένα διαβιβάζονται εκτός του Ευρωπαϊκού Οικονομικού Χώρου (ΕΟΧ), διασφαλίζουμε κατάλληλη εγγύηση κατά το Κεφάλαιο V ΓΚΠΔ:',
        list: [
          'Απόφαση επάρκειας της Ευρωπαϊκής Επιτροπής (Άρθρ. 45 ΓΚΠΔ).',
          'Τυπικές Συμβατικές Ρήτρες της Ευρωπαϊκής Επιτροπής (έκδοση 2021) μαζί με τυχόν συμπληρωματικά μέτρα που προσδιορίζονται σε αξιολόγηση επιπτώσεων διαβίβασης (Άρθρ. 46 ΓΚΠΔ).',
        ],
        p2: 'Μπορείτε να ζητήσετε αντίγραφο της σχετικής εγγύησης επικοινωνώντας μαζί μας στο info@cybratech-solutions.com.',
      },
      {
        h: '10. Διατήρηση δεδομένων',
        sub: 'Διατηρούμε τα προσωπικά δεδομένα μόνο για όσο χρόνο είναι απαραίτητο, μετά τα διαγράφουμε ή ανωνυμοποιούμε:',
        list: [
          'Δεδομένα λογαριασμού και προφίλ: Διάρκεια συνδρομής συν έως 5 χρόνια μετά το κλείσιμο — για υπεράσπιση νομικών αξιώσεων/παραγραφή.',
          'Συμβατικά αρχεία: Έως 10 χρόνια — νόμιμη τήρηση.',
          'Οικονομικά και φορολογικά αρχεία: Σύμφωνα με το εφαρμοστέο φορολογικό δίκαιο — νομική υποχρέωση.',
          'Έγγραφα επαλήθευσης: Έως το κλείσιμο λογαριασμού, στη συνέχεια για τυχόν εφαρμοστέες νόμιμες προθεσμίες τήρησης — νομική υποχρέωση/υπεράσπιση αξιώσεων.',
          'Υποστήριξη και επικοινωνίες: Έως την παραγραφή σχετικών αξιώσεων — έννομα συμφέροντα/υπεράσπιση αξιώσεων.',
        ],
      },
      {
        h: '11. Τα δικαιώματά σας βάσει ΓΚΠΔ',
        sub: 'Έχετε δικαίωμα να:',
        list: [
          'Έχετε πρόσβαση στα προσωπικά σας δεδομένα και να λαμβάνετε αντίγραφο (Άρθρ. 15).',
          'Διορθώνετε ανακριβή ή ελλιπή δεδομένα (Άρθρ. 16).',
          'Διαγράφετε τα δεδομένα σας ("δικαίωμα στη λήθη"), όπου εφαρμόζεται (Άρθρ. 17).',
          'Περιορίζετε την επεξεργασία υπό ορισμένες συνθήκες (Άρθρ. 18).',
          'Εναντιώνεστε στην επεξεργασία βάσει εννόμων συμφερόντων και στο άμεσο μάρκετινγκ ανά πάσα στιγμή (Άρθρ. 21).',
          'Φορητότητα δεδομένων — λάβετε τα δεδομένα σας σε δομημένη, κοινώς χρησιμοποιούμενη, αναγνώσιμη από μηχανή μορφή (Άρθρ. 20).',
          'Ανακαλείτε τη συγκατάθεσή σας ανά πάσα στιγμή, όπου η επεξεργασία βασίζεται σε συγκατάθεση, χωρίς να επηρεάζεται η προηγούμενη επεξεργασία (Άρθρ. 7(3)).',
        ],
        note: 'Για να ασκήσετε τα δικαιώματά σας, επικοινωνήστε: info@cybratech-solutions.com. Θα απαντήσουμε εντός ενός μήνα. Ενδέχεται να χρειαστεί να επαληθεύσουμε την ταυτότητά σας.',
      },
      {
        h: '12. Αυτοματοποιημένη λήψη αποφάσεων',
        p: 'Το PDR Connect δεν λαμβάνει αποφάσεις που παράγουν νομικά ή παρόμοια σημαντικά αποτελέσματα για εσάς βασισμένες αποκλειστικά σε αυτοματοποιημένη επεξεργασία κατά το Άρθρο 22 ΓΚΠΔ. Εάν αυτό αλλάξει, θα ενημερώσουμε την παρούσα Πολιτική και θα σας πληροφορήσουμε για τη λογική που εφαρμόζεται.',
      },
      {
        h: '13. Πώς προστατεύουμε τα δεδομένα σας',
        p: 'Εφαρμόζουμε κατάλληλα τεχνικά και οργανωτικά μέτρα κατά το Άρθρο 32 ΓΚΠΔ για την προστασία των προσωπικών δεδομένων:',
        list: [
          'Κρυπτογράφηση SSL/TLS κατά τη μεταφορά.',
          'Ασφαλείς διακομιστές με ελέγχους πρόσβασης.',
          'Διαδικασίες αυθεντικοποίησης και τακτική παρακολούθηση ασφαλείας.',
          'Αντίγραφα ασφαλείας και διαδικασίες ανάκτησης μετά από καταστροφή.',
        ],
        p2: 'Σε περίπτωση παραβίασης προσωπικών δεδομένων που ενδέχεται να εγκυμονεί κίνδυνο για τα δικαιώματά σας, θα ειδοποιήσουμε την αρμόδια αρχή εντός 72 ωρών και τα θιγόμενα άτομα χωρίς αδικαιολόγητη καθυστέρηση όταν ο κίνδυνος είναι υψηλός.',
      },
      {
        h: '14. Cookies και παρόμοιες τεχνολογίες',
        p: 'Το PDR Connect χρησιμοποιεί cookies που είναι απολύτως αναγκαία για τη λειτουργία της Πλατφόρμας. Μη απαραίτητα cookies — όπως αναλυτικά ή marketing cookies — χρησιμοποιούνται μόνο με την προηγούμενη συγκατάθεσή σας, την οποία μπορείτε να δώσετε ή να ανακαλέσετε ανά πάσα στιγμή.',
        p2: 'Λεπτομέρειες για τα cookies που χρησιμοποιούμε περιλαμβάνονται στην ξεχωριστή Πολιτική Cookies μας.',
      },
      {
        h: '15. Δικαίωμα υποβολής καταγγελίας',
        p: 'Εάν έχετε ανησυχίες σχετικά με τον τρόπο που χειριζόμαστε τα προσωπικά σας δεδομένα, επικοινωνήστε πρώτα μαζί μας. Έχετε επίσης δικαίωμα υποβολής καταγγελίας σε εποπτική αρχή:',
        list: [
          'Κύπρος: Γραφείο Επιτρόπου Προστασίας Δεδομένων Προσωπικού Χαρακτήρα — www.dataprotection.gov.cy — Λευκωσία, Κύπρος.',
          'Μπορείτε επίσης να απευθυνθείτε στην εποπτική αρχή της χώρας διαμονής σας στην ΕΕ/ΕΟΧ ή του τόπου της φερόμενης παράβασης.',
        ],
      },
      {
        h: '16. Αλλαγές στην Πολιτική Απορρήτου',
        p: 'Μπορούμε να ενημερώνουμε κατά καιρούς την παρούσα Πολιτική Απορρήτου. Όταν οι αλλαγές είναι ουσιαστικές, θα σας ειδοποιούμε μέσω της Πλατφόρμας ή email πριν τεθούν σε ισχύ. Η "Ημερομηνία έναρξης ισχύος" στην κορυφή υποδεικνύει πότε η Πολιτική αναθεωρήθηκε τελευταία.',
      },
      {
        h: '17. Επικοινωνήστε μαζί μας',
        p: 'Για οποιεσδήποτε ερωτήσεις σχετικά με την παρούσα Πολιτική Απορρήτου ή τα προσωπικά σας δεδομένα:\nCybratech Solutions Ltd.\nEfesou 9, 5280 Παραλίμνι, Κυπριακή Δημοκρατία\nEmail: info@cybratech-solutions.com\nΙστότοπος: pdrconnect.eu',
      },
    ],
  },
};

export default PRIVACY_CONTENT;
