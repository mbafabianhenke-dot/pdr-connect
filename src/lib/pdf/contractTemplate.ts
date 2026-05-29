import type { ContractLanguage } from '@/types/database';

export interface ContractContext {
  full_name: string;
  role: string;
  email: string;
  language: ContractLanguage;
  date: string;
}

interface ContractContent {
  title: string;
  subtitle: string;
  operator: string;
  watermark: string;
  signed_by: string;
  date_label: string;
  paragraphs: Array<{ heading: string; body: string }>;
}

const OPERATOR = {
  name: 'Cybratech-Solutions',
  address: 'Efesou 9, 5280 Paralimni, Cyprus',
  vat: 'CY60015676H',
  law: 'Republic of Cyprus',
  jurisdiction: 'Nicosia, Cyprus',
};

function buildParagraphs(lang: ContractLanguage, ctx: ContractContext): Array<{ heading: string; body: string }> {
  const P: Record<ContractLanguage, Array<{ heading: string; body: string }>> = {
    en: [
      {
        heading: '§1 – Contracting Parties',
        body: `This agreement is entered into between Cybratech-Solutions (hereinafter "Operator"), registered at Efesou 9, 5280 Paralimni, Cyprus (VAT: CY60015676H), and ${ctx.full_name} (hereinafter "Member"), acting as ${ctx.role}, registered on the PDR Connect platform.`,
      },
      {
        heading: '§2 – Subject Matter',
        body: 'The Operator provides the PDR Connect platform — a B2B matching service for automotive professionals including PDR technicians, car painters, preparers, and dismantlers. This agreement governs the Member\'s access to and use of the platform.',
      },
      {
        heading: '§3 – Membership and Access',
        body: 'Access to PDR Connect is subject to successful identity verification. Members must upload valid documents as specified by the platform. Premium features (messaging, full name visibility) require an active paid subscription of €9.99/month.',
      },
      {
        heading: '§4 – Communication Rules',
        body: 'All communication between Members must take place exclusively through the PDR Connect platform. Members are strictly prohibited from sharing personal contact details (phone numbers, email addresses) or directing other Members to external platforms (WhatsApp, Telegram, Signal, Instagram, Facebook). Violations result in automatic content filtering and may lead to account suspension.',
      },
      {
        heading: '§5 – Data Protection and GDPR',
        body: 'The Operator processes personal data in accordance with Regulation (EU) 2016/679 (GDPR). Personal data collected includes name, role, professional information, and (internally only) email and phone. Email and phone are never displayed publicly. Members have the right to access, rectify, erase, and port their data. Data Protection inquiries may be directed to the Operator\'s registered address.',
      },
      {
        heading: '§6 – Subscription and Payment',
        body: 'Premium membership is billed at €9.99 per month via Stripe. Subscriptions renew automatically until canceled. Upon cancellation or payment failure, premium access is revoked. The Operator reserves the right to modify subscription pricing with 30 days\' prior notice.',
      },
      {
        heading: '§7 – Prohibited Conduct',
        body: 'Members may not: (a) share false or misleading information; (b) attempt to circumvent platform communication rules; (c) engage in harassment or discrimination; (d) violate any applicable laws. The Operator reserves the right to suspend or permanently ban accounts in violation of these rules.',
      },
      {
        heading: '§8 – Limitation of Liability',
        body: 'The Operator acts solely as a matching platform and is not party to any commercial agreements between Members. The Operator is not liable for the quality of services exchanged between Members. The Operator\'s aggregate liability is limited to the amounts paid by the Member in the 3 months preceding any claim.',
      },
      {
        heading: '§9 – Intellectual Property',
        body: 'All platform content, branding, and software are the exclusive property of Cybratech-Solutions. Members retain ownership of their submitted professional content but grant the Operator a non-exclusive, worldwide license to display it within the platform.',
      },
      {
        heading: '§10 – Term and Termination',
        body: 'This agreement is valid for the duration of the Member\'s active account. Either party may terminate with 14 days\' written notice. The Operator may terminate immediately in cases of serious breach. Upon termination, the Member\'s profile and data will be anonymized in accordance with GDPR.',
      },
      {
        heading: '§11 – Governing Law and Jurisdiction',
        body: `This agreement is governed by the laws of the Republic of Cyprus. Any disputes arising from or in connection with this agreement shall be submitted to the exclusive jurisdiction of the courts of Nicosia, Cyprus. This contract is valid exclusively through PDR Connect and bears the watermark "Valid through PDR Connect only".`,
      },
    ],
    de: [
      {
        heading: '§1 – Vertragsparteien',
        body: `Dieser Vertrag wird geschlossen zwischen Cybratech-Solutions (nachfolgend „Betreiber"), eingetragen unter Efesou 9, 5280 Paralimni, Zypern (USt-IdNr.: CY60015676H), und ${ctx.full_name} (nachfolgend „Mitglied"), tätig als ${ctx.role}, registriert auf der Plattform PDR Connect.`,
      },
      {
        heading: '§2 – Vertragsgegenstand',
        body: 'Der Betreiber betreibt die Plattform PDR Connect – einen B2B-Vermittlungsdienst für Kfz-Profis, darunter PDR-Techniker, Autolackierer, Aufbereiter und Demontagefachkräfte. Dieser Vertrag regelt den Zugang und die Nutzung der Plattform durch das Mitglied.',
      },
      {
        heading: '§3 – Mitgliedschaft und Zugang',
        body: 'Der Zugang zu PDR Connect setzt eine erfolgreiche Identitätsprüfung voraus. Mitglieder müssen gültige Dokumente gemäß den Plattformanforderungen hochladen. Premium-Funktionen (Nachrichtenversand, Anzeige vollständiger Namen) erfordern ein aktives kostenpflichtiges Abonnement von 9,99 €/Monat.',
      },
      {
        heading: '§4 – Kommunikationsregeln',
        body: 'Jegliche Kommunikation zwischen Mitgliedern muss ausschließlich über die PDR Connect Plattform erfolgen. Es ist Mitgliedern strikt untersagt, persönliche Kontaktdaten (Telefonnummern, E-Mail-Adressen) zu teilen oder andere Mitglieder auf externe Plattformen (WhatsApp, Telegram, Signal, Instagram, Facebook) zu verweisen. Verstöße führen zu automatischer Inhaltsfilterung und können zur Kontosperrung führen.',
      },
      {
        heading: '§5 – Datenschutz und DSGVO',
        body: 'Der Betreiber verarbeitet personenbezogene Daten gemäß der Verordnung (EU) 2016/679 (DSGVO). Erfasste Daten umfassen Name, Rolle und berufliche Informationen sowie (intern) E-Mail und Telefon. E-Mail und Telefon werden niemals öffentlich angezeigt. Mitglieder haben das Recht auf Auskunft, Berichtigung, Löschung und Datenübertragbarkeit.',
      },
      {
        heading: '§6 – Abonnement und Zahlung',
        body: 'Das Premium-Mitgliedschaft wird mit 9,99 € pro Monat über Stripe abgerechnet. Abonnements verlängern sich automatisch bis zur Kündigung. Bei Kündigung oder Zahlungsausfall wird der Premium-Zugang entzogen. Der Betreiber behält sich vor, die Preise mit 30 Tagen Vorankündigung anzupassen.',
      },
      {
        heading: '§7 – Verbotenes Verhalten',
        body: 'Mitglieder dürfen nicht: (a) falsche oder irreführende Informationen angeben; (b) versuchen, plattforminterne Kommunikationsregeln zu umgehen; (c) Belästigungen oder Diskriminierungen vornehmen; (d) gegen geltendes Recht verstoßen. Der Betreiber behält sich vor, Konten bei Verstößen zu sperren oder dauerhaft zu deaktivieren.',
      },
      {
        heading: '§8 – Haftungsbeschränkung',
        body: 'Der Betreiber fungiert ausschließlich als Vermittlungsplattform und ist nicht Vertragspartei von Vereinbarungen zwischen Mitgliedern. Der Betreiber haftet nicht für die Qualität der zwischen Mitgliedern ausgetauschten Dienstleistungen. Die Gesamthaftung des Betreibers ist auf die vom Mitglied in den letzten 3 Monaten gezahlten Beträge begrenzt.',
      },
      {
        heading: '§9 – Geistiges Eigentum',
        body: 'Alle Plattforminhalte, Marken und Software sind ausschließliches Eigentum von Cybratech-Solutions. Mitglieder behalten das Eigentum an ihren beruflichen Inhalten, räumen dem Betreiber jedoch eine nicht-exklusive, weltweite Lizenz zur Darstellung auf der Plattform ein.',
      },
      {
        heading: '§10 – Laufzeit und Kündigung',
        body: 'Dieser Vertrag gilt für die Dauer des aktiven Kontos. Beide Parteien können mit einer Frist von 14 Tagen schriftlich kündigen. Der Betreiber kann bei schwerwiegenden Verstößen fristlos kündigen. Nach Kündigung werden Profil und Daten gemäß DSGVO anonymisiert.',
      },
      {
        heading: '§11 – Anwendbares Recht und Gerichtsstand',
        body: 'Dieser Vertrag unterliegt dem Recht der Republik Zypern. Alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag unterliegen der ausschließlichen Zuständigkeit der Gerichte in Nikosia, Zypern. Dieser Vertrag ist ausschließlich über PDR Connect gültig und trägt den Aufdruck „Valid through PDR Connect only".',
      },
    ],
    el: [
      { heading: '§1 – Συμβαλλόμενα Μέρη', body: `Η παρούσα σύμβαση συνάπτεται μεταξύ της Cybratech-Solutions (εφεξής «Φορέας Εκμετάλλευσης»), εγγεγραμμένης στη διεύθυνση Εφέσου 9, 5280 Παραλίμνι, Κύπρος (ΑΦΜ: CY60015676H), και του ${ctx.full_name} (εφεξής «Μέλος»), που ενεργεί ως ${ctx.role}, εγγεγραμμένου στην πλατφόρμα PDR Connect.` },
      { heading: '§2 – Αντικείμενο', body: 'Ο Φορέας Εκμετάλλευσης παρέχει την πλατφόρμα PDR Connect — μια υπηρεσία B2B αντιστοίχισης για επαγγελματίες αυτοκινήτων, συμπεριλαμβανομένων τεχνικών PDR, βαφέων αυτοκινήτων, προετοιμαστών και αποσυναρμολογητών. Η παρούσα σύμβαση διέπει την πρόσβαση και χρήση της πλατφόρμας από το Μέλος.' },
      { heading: '§3 – Μέλος και Πρόσβαση', body: 'Η πρόσβαση στο PDR Connect υπόκειται σε επιτυχή επαλήθευση ταυτότητας. Τα Μέλη πρέπει να ανεβάσουν έγκυρα έγγραφα. Οι Premium λειτουργίες (μηνύματα, ορατότητα πλήρους ονόματος) απαιτούν ενεργή συνδρομή €9,99/μήνα.' },
      { heading: '§4 – Κανόνες Επικοινωνίας', body: 'Κάθε επικοινωνία μεταξύ Μελών πρέπει να γίνεται αποκλειστικά μέσω της πλατφόρμας PDR Connect. Απαγορεύεται αυστηρά η κοινοποίηση προσωπικών στοιχείων επικοινωνίας ή η παραπομπή σε εξωτερικές πλατφόρμες. Οι παραβιάσεις οδηγούν σε αυτόματο φιλτράρισμα και ενδεχόμενη αναστολή λογαριασμού.' },
      { heading: '§5 – Προστασία Δεδομένων και ΓΚΠΔ', body: 'Ο Φορέας Εκμετάλλευσης επεξεργάζεται προσωπικά δεδομένα σύμφωνα με τον Κανονισμό (ΕΕ) 2016/679 (ΓΚΠΔ). Email και τηλέφωνο δεν εμφανίζονται ποτέ δημόσια. Τα Μέλη έχουν δικαίωμα πρόσβασης, διόρθωσης, διαγραφής και φορητότητας δεδομένων.' },
      { heading: '§6 – Συνδρομή και Πληρωμή', body: 'Η Premium συνδρομή χρεώνεται στα €9,99 ανά μήνα μέσω Stripe. Οι συνδρομές ανανεώνονται αυτόματα. Κατά την ακύρωση ή αποτυχία πληρωμής, η πρόσβαση Premium ανακαλείται.' },
      { heading: '§7 – Απαγορευμένες Συμπεριφορές', body: 'Απαγορεύεται η παροχή ψευδών πληροφοριών, η παράκαμψη κανόνων επικοινωνίας, η παρενόχληση, η διάκριση και η παραβίαση νόμων. Ο Φορέας Εκμετάλλευσης δικαιούται να αναστείλει ή να απαγορεύσει μόνιμα λογαριασμούς.' },
      { heading: '§8 – Περιορισμός Ευθύνης', body: 'Ο Φορέας Εκμετάλλευσης δεν φέρει ευθύνη για συμφωνίες μεταξύ Μελών ούτε για την ποιότητα των παρεχόμενων υπηρεσιών. Η συνολική ευθύνη περιορίζεται στα ποσά που καταβλήθηκαν τους τελευταίους 3 μήνες.' },
      { heading: '§9 – Πνευματική Ιδιοκτησία', body: 'Όλο το περιεχόμενο, τα εμπορικά σήματα και το λογισμικό αποτελούν αποκλειστική ιδιοκτησία της Cybratech-Solutions. Τα Μέλη διατηρούν την κυριότητα του επαγγελματικού τους περιεχομένου αλλά παρέχουν μη αποκλειστική άδεια χρήσης στον Φορέα.' },
      { heading: '§10 – Διάρκεια και Λύση', body: 'Η παρούσα σύμβαση ισχύει καθ\' όλη τη διάρκεια του ενεργού λογαριασμού. Οποιοδήποτε μέρος μπορεί να καταγγείλει με 14 ημέρες γραπτή προειδοποίηση. Μετά τη λύση, τα δεδομένα ανωνυμοποιούνται σύμφωνα με τον ΓΚΠΔ.' },
      { heading: '§11 – Εφαρμοστέο Δίκαιο και Δικαιοδοσία', body: 'Η παρούσα σύμβαση διέπεται από το δίκαιο της Κυπριακής Δημοκρατίας. Κάθε διαφορά υπάγεται στην αποκλειστική δικαιοδοσία των δικαστηρίων Λευκωσίας, Κύπρος. Αυτή η σύμβαση ισχύει αποκλειστικά μέσω του PDR Connect και φέρει το υδατόσημο "Valid through PDR Connect only".' },
    ],
    es: [
      { heading: '§1 – Partes Contratantes', body: `Este contrato se celebra entre Cybratech-Solutions (en adelante "Operador"), registrada en Efesou 9, 5280 Paralimni, Chipre (NIF: CY60015676H), y ${ctx.full_name} (en adelante "Miembro"), en calidad de ${ctx.role}, registrado en la plataforma PDR Connect.` },
      { heading: '§2 – Objeto', body: 'El Operador presta la plataforma PDR Connect — un servicio de intermediación B2B para profesionales del automóvil, incluyendo técnicos PDR, pintores de coches, preparadores y desguazadores. Este contrato regula el acceso y uso de la plataforma por parte del Miembro.' },
      { heading: '§3 – Membresía y Acceso', body: 'El acceso a PDR Connect está sujeto a la verificación de identidad. Los Miembros deben cargar documentos válidos según lo especificado. Las funciones Premium (mensajes, visibilidad del nombre completo) requieren una suscripción activa de €9,99/mes.' },
      { heading: '§4 – Normas de Comunicación', body: 'Toda comunicación entre Miembros debe realizarse exclusivamente a través de la plataforma PDR Connect. Está estrictamente prohibido compartir datos de contacto personales o redirigir a plataformas externas. Las infracciones resultan en filtrado automático y pueden llevar a la suspensión de la cuenta.' },
      { heading: '§5 – Protección de Datos y RGPD', body: 'El Operador trata datos personales de conformidad con el Reglamento (UE) 2016/679 (RGPD). El email y el teléfono no se muestran nunca públicamente. Los Miembros tienen derecho de acceso, rectificación, supresión y portabilidad de sus datos.' },
      { heading: '§6 – Suscripción y Pago', body: 'La membresía Premium se factura a €9,99 por mes a través de Stripe. Las suscripciones se renuevan automáticamente. Tras la cancelación o fallo de pago, el acceso Premium se revoca. El Operador se reserva el derecho a modificar los precios con 30 días de antelación.' },
      { heading: '§7 – Conductas Prohibidas', body: 'Los Miembros no pueden: (a) proporcionar información falsa; (b) intentar eludir las reglas de comunicación; (c) acosar o discriminar; (d) infringir la legislación aplicable. El Operador puede suspender o prohibir permanentemente cuentas en infracción.' },
      { heading: '§8 – Limitación de Responsabilidad', body: 'El Operador actúa exclusivamente como plataforma de intermediación. La responsabilidad agregada del Operador se limita a los importes abonados por el Miembro en los 3 meses anteriores a cualquier reclamación.' },
      { heading: '§9 – Propiedad Intelectual', body: 'Todo el contenido, marcas y software son propiedad exclusiva de Cybratech-Solutions. Los Miembros retienen la propiedad de su contenido profesional pero conceden al Operador una licencia no exclusiva para mostrarlo en la plataforma.' },
      { heading: '§10 – Vigencia y Rescisión', body: 'Este contrato es válido durante la existencia de la cuenta activa. Cualquiera de las partes puede rescindirlo con 14 días de preaviso. Tras la rescisión, el perfil y los datos del Miembro serán anonimizados conforme al RGPD.' },
      { heading: '§11 – Ley Aplicable y Jurisdicción', body: 'Este contrato se rige por la ley de la República de Chipre. Cualquier disputa se someterá a la jurisdicción exclusiva de los tribunales de Nicosia, Chipre. Este contrato es válido exclusivamente a través de PDR Connect y lleva la marca de agua "Valid through PDR Connect only".' },
    ],
  };

  return P[lang];
}

export function getContractContent(ctx: ContractContext): ContractContent {
  const titles: Record<ContractLanguage, { title: string; subtitle: string; signed_by: string; date_label: string }> = {
    en: { title: 'PDR Connect — Member Agreement', subtitle: 'Platform Usage Contract', signed_by: 'Agreed and signed by', date_label: 'Date' },
    de: { title: 'PDR Connect — Mitgliedervertrag', subtitle: 'Plattform-Nutzungsvertrag', signed_by: 'Vereinbart und unterzeichnet von', date_label: 'Datum' },
    el: { title: 'PDR Connect — Σύμβαση Μέλους', subtitle: 'Σύμβαση Χρήσης Πλατφόρμας', signed_by: 'Συμφωνήθηκε και υπογράφηκε από', date_label: 'Ημερομηνία' },
    es: { title: 'PDR Connect — Acuerdo de Miembro', subtitle: 'Contrato de Uso de la Plataforma', signed_by: 'Aceptado y firmado por', date_label: 'Fecha' },
  };

  return {
    ...titles[ctx.language],
    operator: `${OPERATOR.name} · ${OPERATOR.address} · VAT: ${OPERATOR.vat}`,
    watermark: 'Valid through PDR Connect only',
    paragraphs: buildParagraphs(ctx.language, ctx),
  };
}
