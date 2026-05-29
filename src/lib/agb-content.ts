export type AgbSection = {
  h: string;
  p?: string;
  list?: string[];
  p2?: string;
};

export type AgbContent = {
  title: string;
  subtitle: string;
  sections: AgbSection[];
  acceptBtn: string;
  closeBtn: string;
  scrollHint: string;
};

const AGB_CONTENT: Record<string, AgbContent> = {
  en: {
    title: 'General Terms and Conditions (GTC)',
    subtitle: 'PDR Connect · Effective upon registration',
    acceptBtn: 'I have read and accept the Terms and Conditions',
    closeBtn: 'Close',
    scrollHint: 'Please scroll to the bottom to accept.',
    sections: [
      {
        h: '§1 Scope of Application',
        p: 'These General Terms and Conditions (GTC) apply to the use of the "PDR Connect" platform, app and website. By registering, the User accepts these Terms and Conditions.',
      },
      {
        h: '§2 Provider',
        p: 'The platform provider is:\nCybratech Solutions Ltd.\nAddress: Efesou 9, 5280 Paralimni, Cyprus\nPhone: +357 95 066293\nE-mail: info@cybratech-solutions.com',
      },
      {
        h: '§3 Service Description',
        p: 'PDR Connect is a platform for the placement of skilled workers in the following fields:',
        list: [
          'PDR technique (paintless dent repair)',
          'Bodywork',
          'Disassembly and painting',
        ],
        p2: 'The platform enables: creating user profiles, presenting availability and qualifications, communication between users, and publishing job offers.',
      },
      {
        h: '§4 Registration and User Account',
        p: '(1) Registration is required to use the platform.\n(2) Users are required to provide truthful information.\n(3) Access data must be treated confidentially and must not be transferred to third parties.\n(4) The Provider reserves the right to block or delete accounts in the event of violations.',
      },
      {
        h: '§5 Content and Documents',
        p: '(1) Users may upload content, in particular: images, descriptions, documents (e.g. ID card, A1 certificate, certificates).\n(2) The User warrants that all information is correct and that they have the right to upload the content.\n(3) The Provider assumes no responsibility for the accuracy of the content.\n(4) Documents are only made visible according to the user\'s settings.',
      },
      {
        h: '§6 Using the Platform',
        p: '(1) The platform may only be used for lawful purposes.\n(2) In particular, the following are prohibited:',
        list: [
          'False or misleading information',
          'Abuse of contacts',
          'Unauthorized advertising',
          'Illegal content',
        ],
      },
      {
        h: '§7 Communication Rules',
        p: 'All communication between members must occur exclusively through PDR Connect\'s built-in messaging system. Sharing phone numbers, email addresses, or references to external platforms (WhatsApp, Telegram, Signal, Instagram, Facebook, etc.) is strictly prohibited. Violations are automatically detected, logged, and your bypass counter is incremented. Accounts reaching 5 or more violations are automatically suspended.',
      },
      {
        h: '§8 Contracts, Payment Processing, and Platform Fee',
        p: '(1) All contracts for services arranged through PDR Connect are concluded directly with the platform operator, Cybratech Solutions Ltd. (PDR Connect).\n(2) PDR Connect acts as the contractual party in coordination with the placed professionals.\n(3) All invoices are issued exclusively by PDR Connect (Cybratech Solutions Ltd.). All payments and transfers are processed exclusively through the platform.\n(4) PDR Connect charges the following platform service fees, applied independently to each transaction:\n— Clients currently pay no platform service fee. During the launch phase, PDR Connect\'s placement and matching services are provided to Clients free of charge. Clients are invoiced only for the agreed technician remuneration. Example: agreed value €1,000 → Client pays €1,000.\n— Technicians/Workers are charged a platform fee of 10% (ten percent) of the total agreed assignment value. Technicians receive 90% of the agreed value after deduction. Example: agreed value €1,000 → Technician receives €900.\n(5) Direct payment arrangements between users and technicians outside the platform are strictly prohibited and constitute a material violation of these Terms, which may result in immediate account termination.',
      },
      {
        h: '§9 Access and Pricing',
        p: 'During the current launch phase, all platform features — including messaging, search, and full profile visibility — are available free of charge to all registered users. The Provider reserves the right to introduce premium features or subscription plans in the future. Existing users will be notified in advance of any such changes.',
      },
      {
        h: '§10 Liability',
        p: '(1) The Provider is only liable in the event of intent and gross negligence.\n(2) For simple negligence, the Provider is only liable in the event of a breach of essential contractual obligations.\n(3) The Provider assumes no liability for: data loss, incorrect user information, or platform failures.',
      },
      {
        h: '§11 Availability',
        p: 'The Provider strives to ensure that the platform is available as uninterruptedly as possible, but does not guarantee uninterrupted availability. Scheduled maintenance will be announced in advance.',
      },
      {
        h: '§12 Termination / Cancellation',
        p: '(1) Users may delete their account at any time.\n(2) The Provider may block or delete accounts in the event of violations, abuse, or fraudulent activity, and may do so without prior notice in serious cases.',
      },
      {
        h: '§13 Data Protection',
        p: 'The processing of personal data is carried out in accordance with the Privacy Policy and in compliance with the General Data Protection Regulation (GDPR). By registering, you expressly consent to the processing of your personal data as described therein.',
      },
      {
        h: '§14 Changes to the Terms and Conditions',
        p: 'The Provider reserves the right to change these Terms and Conditions at any time. Users will be informed accordingly. Continued use of the platform after the notification period constitutes acceptance of the updated Terms.',
      },
      {
        h: '§15 Applicable Law',
        p: 'The law of the Republic of Cyprus applies. Any disputes arising from the use of PDR Connect shall be brought before the competent courts of Nicosia, Cyprus.',
      },
      {
        h: '§16 Final Provisions',
        p: 'Should individual provisions be invalid or unenforceable, the validity of the remaining provisions remains unaffected. The invalid provision shall be replaced by a legally valid provision that comes closest to the economic purpose of the original.',
      },
    ],
  },

  de: {
    title: 'Allgemeine Geschäftsbedingungen (AGB)',
    subtitle: 'PDR Connect · Gültig ab Registrierung',
    acceptBtn: 'Ich habe die AGB gelesen und akzeptiere sie',
    closeBtn: 'Schließen',
    scrollHint: 'Bitte scrollen Sie bis zum Ende, um zu akzeptieren.',
    sections: [
      {
        h: '§1 Geltungsbereich',
        p: 'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Plattform „PDR Connect" App und Website. Mit der Registrierung akzeptiert der Nutzer diese AGB.',
      },
      {
        h: '§2 Anbieter',
        p: 'Anbieter der Plattform ist:\nCybratech Solutions Ltd.\nAdresse: Efesou 9, 5280 Paralimni, Zypern\nTelefon: +357 95 066293\nE-Mail: info@cybratech-solutions.com',
      },
      {
        h: '§3 Leistungsbeschreibung',
        p: 'PDR Connect ist eine Plattform zur Vermittlung von Fachkräften im Bereich:',
        list: [
          'PDR-Technik (lackschadenfreie Ausbeultechnik)',
          'Karosseriearbeiten',
          'Zerlegung und Lackierung',
        ],
        p2: 'Die Plattform ermöglicht: Erstellung von Nutzerprofilen, Darstellung von Verfügbarkeit und Qualifikationen, Kontaktaufnahme zwischen Nutzern sowie Veröffentlichung von Jobangeboten.',
      },
      {
        h: '§4 Registrierung und Nutzerkonto',
        p: '(1) Die Nutzung der Plattform erfordert eine Registrierung.\n(2) Nutzer sind verpflichtet, wahrheitsgemäße Angaben zu machen.\n(3) Zugangsdaten sind vertraulich zu behandeln und dürfen nicht an Dritte weitergegeben werden.\n(4) Der Anbieter behält sich vor, Accounts bei Verstößen zu sperren oder zu löschen.',
      },
      {
        h: '§5 Inhalte und Dokumente',
        p: '(1) Nutzer können Inhalte hochladen, insbesondere: Bilder, Beschreibungen, Dokumente (z. B. Ausweis, A1-Bescheinigung, Zertifikate).\n(2) Der Nutzer versichert, dass alle Angaben korrekt sind und er berechtigt ist, die Inhalte hochzuladen.\n(3) Der Anbieter übernimmt keine Haftung für die Richtigkeit der Inhalte.\n(4) Dokumente werden nur gemäß den Einstellungen des Nutzers sichtbar gemacht.',
      },
      {
        h: '§6 Nutzung der Plattform',
        p: '(1) Die Plattform darf nur für legale Zwecke genutzt werden.\n(2) Untersagt sind insbesondere:',
        list: [
          'Falsche oder irreführende Angaben',
          'Missbrauch von Kontakten',
          'Unerlaubte Werbung',
          'Rechtswidrige Inhalte',
        ],
      },
      {
        h: '§7 Kommunikationsregeln',
        p: 'Jegliche Kommunikation zwischen Mitgliedern muss ausschließlich über das integrierte Nachrichtensystem von PDR Connect erfolgen. Das Teilen von Telefonnummern, E-Mail-Adressen oder Verweise auf externe Plattformen (WhatsApp, Telegram, Signal, Instagram, Facebook usw.) ist streng verboten. Verstöße werden automatisch erkannt, protokolliert und Ihr Bypass-Zähler wird erhöht. Konten mit 5 oder mehr Verstößen werden automatisch gesperrt.',
      },
      {
        h: '§8 Verträge, Zahlungsabwicklung und Plattformgebühr',
        p: '(1) Alle über PDR Connect vermittelten Verträge über Dienstleistungen werden direkt mit dem Plattformbetreiber Cybratech Solutions Ltd. (PDR Connect) abgeschlossen.\n(2) PDR Connect tritt als Vertragspartner in Abstimmung mit den vermittelten Fachkräften auf.\n(3) Alle Rechnungen werden ausschließlich von PDR Connect (Cybratech Solutions Ltd.) ausgestellt. Sämtliche Zahlungen und Überweisungen erfolgen ausschließlich über die Plattform.\n(4) PDR Connect erhebt folgende Plattformgebühren, die je Transaktion separat anfallen:\n— Auftraggeber zahlen derzeit keine Plattformgebühr. In der Startphase sind die Vermittlungs- und Matching-Leistungen von PDR Connect für Auftraggeber kostenlos. Auftraggeber werden ausschließlich mit der vereinbarten Technikervergütung in Rechnung gestellt. Beispiel: vereinbarter Wert 1.000 € → Auftraggeber zahlt 1.000 €.\n— Techniker/Arbeitnehmer werden mit einer Plattformgebühr von 10 % (zehn Prozent) belastet. Techniker erhalten 90 % des vereinbarten Auftragswerts nach Abzug. Beispiel: vereinbarter Wert 1.000 € → Techniker erhält 900 €.\n(5) Direkte Zahlungsvereinbarungen zwischen Nutzern und Technikern außerhalb der Plattform sind ausdrücklich untersagt und stellen eine wesentliche Verletzung dieser AGB dar, die zur sofortigen Kontosperrung führen kann.',
      },
      {
        h: '§9 Zugang und Preisgestaltung',
        p: 'In der aktuellen Startphase stehen alle Plattformfunktionen — einschließlich Nachrichten, Suche und vollständige Profil­sichtbarkeit — allen registrierten Nutzern kostenlos zur Verfügung. Der Anbieter behält sich vor, in Zukunft Premium-Funktionen oder Abonnement­pläne einzuführen. Bestehende Nutzer werden vorab über solche Änderungen informiert.',
      },
      {
        h: '§10 Haftung',
        p: '(1) Der Anbieter haftet nur bei Vorsatz und grober Fahrlässigkeit.\n(2) Für einfache Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten.\n(3) Der Anbieter übernimmt keine Haftung für: Datenverluste, falsche Nutzerangaben oder Ausfälle der Plattform.',
      },
      {
        h: '§11 Verfügbarkeit',
        p: 'Der Anbieter bemüht sich um eine möglichst unterbrechungsfreie Verfügbarkeit der Plattform, übernimmt jedoch keine Garantie. Geplante Wartungsarbeiten werden im Voraus angekündigt.',
      },
      {
        h: '§12 Kündigung',
        p: '(1) Nutzer können ihr Konto jederzeit löschen.\n(2) Der Anbieter kann Konten bei Verstößen, Missbrauch oder betrügerischer Aktivität sperren oder löschen, in schwerwiegenden Fällen auch ohne vorherige Ankündigung.',
      },
      {
        h: '§13 Datenschutz',
        p: 'Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzerklärung und unter Beachtung der Datenschutz-Grundverordnung (DSGVO). Mit der Registrierung stimmen Sie ausdrücklich der Verarbeitung Ihrer personenbezogenen Daten zu.',
      },
      {
        h: '§14 Änderungen der AGB',
        p: 'Der Anbieter behält sich vor, diese AGB jederzeit zu ändern. Nutzer werden darüber informiert. Die weitere Nutzung der Plattform nach Ablauf der Ankündigungsfrist gilt als Zustimmung zu den aktualisierten AGB.',
      },
      {
        h: '§15 Anwendbares Recht',
        p: 'Es gilt das Recht der Republik Zypern. Alle Streitigkeiten, die sich aus der Nutzung von PDR Connect ergeben, sind vor den zuständigen Gerichten in Nikosia, Zypern, zu klären.',
      },
      {
        h: '§16 Schlussbestimmungen',
        p: 'Sollten einzelne Bestimmungen unwirksam oder undurchführbar sein, bleibt die Wirksamkeit der übrigen Regelungen unberührt. Die unwirksame Bestimmung wird durch eine rechtsgültige Regelung ersetzt, die dem wirtschaftlichen Zweck am nächsten kommt.',
      },
    ],
  },

  el: {
    title: 'Γενικοί Όροι και Προϋποθέσεις (ΓΟΠ)',
    subtitle: 'PDR Connect · Ισχύει από την εγγραφή',
    acceptBtn: 'Διάβασα και αποδέχομαι τους Όρους και Προϋποθέσεις',
    closeBtn: 'Κλείσιμο',
    scrollHint: 'Παρακαλώ κυλήστε μέχρι το τέλος για να αποδεχτείτε.',
    sections: [
      {
        h: '§1 Πεδίο Εφαρμογής',
        p: 'Οι παρόντες Γενικοί Όροι και Προϋποθέσεις (ΓΟΠ) ισχύουν για τη χρήση της πλατφόρμας, εφαρμογής και ιστοτόπου «PDR Connect». Με την εγγραφή του, ο Χρήστης αποδέχεται τους παρόντες Όρους και Προϋποθέσεις.',
      },
      {
        h: '§2 Πάροχος',
        p: 'Πάροχος της πλατφόρμας είναι:\nCybratech Solutions Ltd.\nΔιεύθυνση: Efesou 9, 5280 Παραλίμνι, Κύπρος\nΤηλέφωνο: +357 95 066293\nE-mail: info@cybratech-solutions.com',
      },
      {
        h: '§3 Περιγραφή Υπηρεσίας',
        p: 'Το PDR Connect είναι μια πλατφόρμα τοποθέτησης ειδικευμένων εργαζομένων στους τομείς:',
        list: [
          'Τεχνική PDR (τεχνική αφαίρεσης βαθουλωμάτων χωρίς φθορά βαφής)',
          'Εργασίες αμαξώματος',
          'Αποσυναρμολόγηση και βαφή',
        ],
        p2: 'Η πλατφόρμα επιτρέπει: δημιουργία προφίλ χρηστών, παρουσίαση διαθεσιμότητας και προσόντων, επικοινωνία μεταξύ χρηστών και δημοσίευση προσφορών εργασίας.',
      },
      {
        h: '§4 Εγγραφή και Λογαριασμός Χρήστη',
        p: '(1) Για τη χρήση της πλατφόρμας απαιτείται εγγραφή.\n(2) Οι Χρήστες υποχρεούνται να παρέχουν αληθείς πληροφορίες.\n(3) Τα δεδομένα πρόσβασης πρέπει να αντιμετωπίζονται εμπιστευτικά και δεν επιτρέπεται να κοινοποιούνται σε τρίτους.\n(4) Ο Πάροχος διατηρεί το δικαίωμα να αποκλείσει ή να διαγράψει λογαριασμούς σε περίπτωση παραβάσεων.',
      },
      {
        h: '§5 Περιεχόμενα και Έγγραφα',
        p: '(1) Οι Χρήστες μπορούν να αναφορτώνουν περιεχόμενα, ιδίως: εικόνες, περιγραφές, έγγραφα (π.χ. ταυτότητα, πιστοποιητικό Α1, πιστοποιητικά).\n(2) Ο Χρήστης εγγυάται ότι όλες οι πληροφορίες είναι σωστές και ότι έχει το δικαίωμα αναφόρτωσης.\n(3) Ο Πάροχος δεν αναλαμβάνει καμία ευθύνη για την ακρίβεια των περιεχομένων.\n(4) Τα έγγραφα καθίστανται ορατά μόνο σύμφωνα με τις ρυθμίσεις του Χρήστη.',
      },
      {
        h: '§6 Χρήση της Πλατφόρμας',
        p: '(1) Η πλατφόρμα μπορεί να χρησιμοποιηθεί μόνο για νόμιμους σκοπούς.\n(2) Ειδικότερα, απαγορεύονται:',
        list: [
          'Ψευδείς ή παραπλανητικές πληροφορίες',
          'Κατάχρηση επαφών',
          'Μη εξουσιοδοτημένη διαφήμιση',
          'Παράνομο περιεχόμενο',
        ],
      },
      {
        h: '§7 Κανόνες Επικοινωνίας',
        p: 'Κάθε επικοινωνία μεταξύ μελών πρέπει να πραγματοποιείται αποκλειστικά μέσω του ενσωματωμένου συστήματος μηνυμάτων του PDR Connect. Η κοινοποίηση αριθμών τηλεφώνου, διευθύνσεων email ή παραπομπών σε εξωτερικές πλατφόρμες (WhatsApp, Telegram, Signal, Instagram, Facebook κ.λπ.) απαγορεύεται αυστηρά. Οι παραβάσεις ανιχνεύονται αυτόματα, καταγράφονται και ο μετρητής bypass αυξάνεται. Λογαριασμοί με 5 ή περισσότερες παραβάσεις αναστέλλονται αυτόματα.',
      },
      {
        h: '§8 Συμβάσεις, Διεκπεραίωση Πληρωμών και Χρέωση Πλατφόρμας',
        p: '(1) Όλες οι συμβάσεις για υπηρεσίες που διαμεσολαβούνται μέσω του PDR Connect συνάπτονται απευθείας με τον φορέα εκμετάλλευσης της πλατφόρμας, Cybratech Solutions Ltd. (PDR Connect).\n(2) Η PDR Connect ενεργεί ως συμβαλλόμενο μέρος σε συνεννόηση με τους τοποθετούμενους επαγγελματίες.\n(3) Όλα τα τιμολόγια εκδίδονται αποκλειστικά από την PDR Connect (Cybratech Solutions Ltd.). Όλες οι πληρωμές και μεταφορές χρημάτων πραγματοποιούνται αποκλειστικά μέσω της πλατφόρμας.\n(4) Η PDR Connect επιβάλλει τις ακόλουθες χρεώσεις πλατφόρμας, που εφαρμόζονται ανεξάρτητα σε κάθε συναλλαγή:\n— Οι Πελάτες δεν χρεώνονται αμοιβή πλατφόρμας προς το παρόν. Κατά τη φάση εκκίνησης, οι υπηρεσίες τοποθέτησης και αντιστοίχισης της PDR Connect παρέχονται στους Πελάτες δωρεάν. Οι Πελάτες τιμολογούνται μόνο για τη συμφωνηθείσα αμοιβή τεχνικού. Παράδειγμα: συμφωνηθείσα αξία 1.000 € → Πελάτης πληρώνει 1.000 €.\n— Στους Τεχνικούς/Εργαζομένους επιβάλλεται χρέωση πλατφόρμας 10% (δέκα τοις εκατό). Οι τεχνικοί λαμβάνουν το 90% της συμφωνηθείσας αξίας μετά από αφαίρεση. Παράδειγμα: συμφωνηθείσα αξία 1.000 € → Τεχνικός λαμβάνει 900 €.\n(5) Απευθείας οικονομικές συμφωνίες μεταξύ χρηστών και τεχνικών εκτός πλατφόρμας απαγορεύονται ρητά και συνιστούν ουσιώδη παράβαση των παρόντων Όρων, η οποία μπορεί να οδηγήσει σε άμεση αναστολή λογαριασμού.',
      },
      {
        h: '§9 Πρόσβαση και Τιμολόγηση',
        p: 'Κατά την τρέχουσα φάση εκκίνησης, όλες οι λειτουργίες της πλατφόρμας — συμπεριλαμβανομένων μηνυμάτων, αναζήτησης και πλήρους ορατότητας προφίλ — είναι διαθέσιμες δωρεάν σε όλους τους εγγεγραμμένους χρήστες. Ο Πάροχος διατηρεί το δικαίωμα να εισαγάγει premium λειτουργίες ή σχέδια συνδρομής στο μέλλον. Οι υφιστάμενοι χρήστες θα ενημερώνονται εκ των προτέρων για τυχόν αλλαγές.',
      },
      {
        h: '§10 Ευθύνη',
        p: '(1) Ο Πάροχος ευθύνεται μόνο σε περίπτωση πρόθεσης και βαριάς αμέλειας.\n(2) Για απλή αμέλεια, ο Πάροχος ευθύνεται μόνο σε περίπτωση παράβασης βασικών συμβατικών υποχρεώσεων.\n(3) Ο Πάροχος δεν αναλαμβάνει ευθύνη για: απώλεια δεδομένων, λανθασμένες πληροφορίες χρηστών ή αστοχίες της πλατφόρμας.',
      },
      {
        h: '§11 Διαθεσιμότητα',
        p: 'Ο Πάροχος προσπαθεί να διασφαλίσει αδιάλειπτη λειτουργία της πλατφόρμας, αλλά δεν αναλαμβάνει καμία εγγύηση. Προγραμματισμένες συντηρήσεις θα ανακοινώνονται εκ των προτέρων.',
      },
      {
        h: '§12 Καταγγελία',
        p: '(1) Οι Χρήστες μπορούν να διαγράψουν τον λογαριασμό τους ανά πάσα στιγμή.\n(2) Ο Πάροχος μπορεί να αποκλείσει ή να διαγράψει λογαριασμούς σε περίπτωση παραβάσεων, κατάχρησης ή δόλιας δραστηριότητας.',
      },
      {
        h: '§13 Προστασία Δεδομένων',
        p: 'Η επεξεργασία προσωπικών δεδομένων πραγματοποιείται σύμφωνα με την Πολιτική Απορρήτου και σε συμμόρφωση με τον Γενικό Κανονισμό Προστασίας Δεδομένων (ΓΚΠΔ). Με την εγγραφή, συναινείτε ρητά στην επεξεργασία των προσωπικών σας δεδομένων.',
      },
      {
        h: '§14 Αλλαγές στους Όρους',
        p: 'Ο Πάροχος διατηρεί το δικαίωμα να τροποποιεί τους παρόντες Όρους ανά πάσα στιγμή. Οι Χρήστες θα ενημερώνονται σχετικά. Η συνέχιση χρήσης μετά την ειδοποίηση συνιστά αποδοχή των τροποποιημένων Όρων.',
      },
      {
        h: '§15 Εφαρμοστέο Δίκαιο',
        p: 'Εφαρμόζεται το δίκαιο της Κυπριακής Δημοκρατίας. Κάθε διαφορά που προκύπτει από τη χρήση του PDR Connect εκδικάζεται ενώπιον των αρμόδιων δικαστηρίων Λευκωσίας, Κύπρος.',
      },
      {
        h: '§16 Τελικές Διατάξεις',
        p: 'Σε περίπτωση που μεμονωμένες διατάξεις είναι άκυρες ή ανεφάρμοστες, η ισχύς των υπόλοιπων διατάξεων παραμένει ανεπηρέαστη. Η άκυρη διάταξη αντικαθίσταται από νομικά έγκυρη ρύθμιση που προσεγγίζει περισσότερο τον οικονομικό σκοπό της αρχικής.',
      },
    ],
  },

  es: {
    title: 'Términos y Condiciones Generales (TCG)',
    subtitle: 'PDR Connect · Vigentes desde el registro',
    acceptBtn: 'He leído y acepto los Términos y Condiciones',
    closeBtn: 'Cerrar',
    scrollHint: 'Por favor, desplácese hasta el final para aceptar.',
    sections: [
      {
        h: '§1 Ámbito de Aplicación',
        p: 'Estos Términos y Condiciones Generales (TCG) se aplican al uso de la plataforma, aplicación y sitio web "PDR Connect". Al registrarse, el Usuario acepta estos Términos y Condiciones.',
      },
      {
        h: '§2 Proveedor',
        p: 'El proveedor de la plataforma es:\nCybratech Solutions Ltd.\nDirección: Efesou 9, 5280 Paralimni, Chipre\nTeléfono: +357 95 066293\nCorreo: info@cybratech-solutions.com',
      },
      {
        h: '§3 Descripción del Servicio',
        p: 'PDR Connect es una plataforma para la colocación de trabajadores cualificados en los siguientes ámbitos:',
        list: [
          'Técnica PDR (reparación de abolladuras sin pintura)',
          'Trabajos de carrocería',
          'Desmontaje y pintura',
        ],
        p2: 'La plataforma permite: crear perfiles de usuario, presentar disponibilidad y cualificaciones, comunicación entre usuarios y publicar ofertas de trabajo.',
      },
      {
        h: '§4 Registro y Cuenta de Usuario',
        p: '(1) Es necesario registrarse para utilizar la plataforma.\n(2) Los Usuarios están obligados a proporcionar información veraz.\n(3) Los datos de acceso deben tratarse de forma confidencial y no pueden transferirse a terceros.\n(4) El Proveedor se reserva el derecho de bloquear o eliminar cuentas en caso de infracciones.',
      },
      {
        h: '§5 Contenido y Documentos',
        p: '(1) Los Usuarios pueden cargar contenidos, en particular: imágenes, descripciones, documentos (p. ej. DNI, certificado A1, certificados).\n(2) El Usuario garantiza que toda la información es correcta y que tiene derecho a cargar el contenido.\n(3) El Proveedor no asume ninguna responsabilidad por la exactitud del contenido.\n(4) Los documentos solo se hacen visibles según la configuración del usuario.',
      },
      {
        h: '§6 Uso de la Plataforma',
        p: '(1) La plataforma solo puede utilizarse con fines legales.\n(2) En particular, están prohibidos:',
        list: [
          'Información falsa o engañosa',
          'Abuso de contactos',
          'Publicidad no autorizada',
          'Contenido ilegal',
        ],
      },
      {
        h: '§7 Normas de Comunicación',
        p: 'Toda comunicación entre miembros debe realizarse exclusivamente a través del sistema de mensajería integrado de PDR Connect. Está estrictamente prohibido compartir números de teléfono, direcciones de correo electrónico o referencias a plataformas externas (WhatsApp, Telegram, Signal, Instagram, Facebook, etc.). Las infracciones se detectan automáticamente, se registran y su contador de bypass se incrementa. Las cuentas con 5 o más infracciones son suspendidas automáticamente.',
      },
      {
        h: '§8 Contratos, Procesamiento de Pagos y Tarifa de Plataforma',
        p: '(1) Todos los contratos por servicios intermediados a través de PDR Connect se celebran directamente con el operador de la plataforma, Cybratech Solutions Ltd. (PDR Connect).\n(2) PDR Connect actúa como parte contratante en coordinación con los profesionales colocados.\n(3) Todas las facturas son emitidas exclusivamente por PDR Connect (Cybratech Solutions Ltd.). Todos los pagos y transferencias se procesan exclusivamente a través de la plataforma.\n(4) PDR Connect aplica las siguientes tarifas de servicio de plataforma, aplicadas de forma independiente en cada transacción:\n— Los Clientes actualmente no pagan ninguna tarifa de plataforma. Durante la fase de lanzamiento, los servicios de colocación y matching de PDR Connect se ofrecen a los Clientes de forma gratuita. A los Clientes se les factura únicamente la remuneración acordada del técnico. Ejemplo: valor acordado €1.000 → Cliente paga €1.000.\n— A los Técnicos/Trabajadores se les cobra una tarifa de plataforma del 10% (diez por ciento). Los técnicos reciben el 90% del valor acordado tras la deducción. Ejemplo: valor acordado €1.000 → Técnico recibe €900.\n(5) Los acuerdos de pago directos entre usuarios y técnicos fuera de la plataforma están estrictamente prohibidos y constituyen una infracción material de estos Términos, lo que puede resultar en la terminación inmediata de la cuenta.',
      },
      {
        h: '§9 Acceso y Precios',
        p: 'Durante la fase de lanzamiento actual, todas las funciones de la plataforma — incluyendo mensajería, búsqueda y visibilidad completa del perfil — están disponibles de forma gratuita para todos los usuarios registrados. El Proveedor se reserva el derecho de introducir funciones premium o planes de suscripción en el futuro. Los usuarios existentes serán notificados con antelación de dichos cambios.',
      },
      {
        h: '§10 Responsabilidad',
        p: '(1) El Proveedor solo es responsable en caso de dolo y negligencia grave.\n(2) Por negligencia simple, el Proveedor solo es responsable en caso de incumplimiento de obligaciones contractuales esenciales.\n(3) El Proveedor no asume responsabilidad por: pérdida de datos, información incorrecta de usuarios o fallos de la plataforma.',
      },
      {
        h: '§11 Disponibilidad',
        p: 'El Proveedor se esfuerza por garantizar la disponibilidad ininterrumpida de la plataforma, pero no garantiza una disponibilidad sin interrupciones. El mantenimiento programado se anunciará con antelación.',
      },
      {
        h: '§12 Cancelación / Rescisión',
        p: '(1) Los Usuarios pueden eliminar su cuenta en cualquier momento.\n(2) El Proveedor puede bloquear o eliminar cuentas en caso de infracciones, abusos o actividad fraudulenta, incluso sin previo aviso en casos graves.',
      },
      {
        h: '§13 Protección de Datos',
        p: 'El tratamiento de datos personales se lleva a cabo de conformidad con la Política de Privacidad y en cumplimiento del Reglamento General de Protección de Datos (RGPD). Al registrarse, usted consiente expresamente el tratamiento de sus datos personales.',
      },
      {
        h: '§14 Modificaciones de los Términos',
        p: 'El Proveedor se reserva el derecho de modificar estos Términos en cualquier momento. Los usuarios serán informados al respecto. El uso continuado de la plataforma tras la notificación constituye aceptación de los Términos actualizados.',
      },
      {
        h: '§15 Ley Aplicable',
        p: 'Se aplica la ley de la República de Chipre. Cualquier disputa derivada del uso de PDR Connect deberá presentarse ante los tribunales competentes de Nicosia, Chipre.',
      },
      {
        h: '§16 Disposiciones Finales',
        p: 'Si alguna disposición fuera inválida o inaplicable, la validez de las disposiciones restantes no se verá afectada. La disposición inválida será reemplazada por una disposición legalmente válida que se aproxime más al propósito económico de la original.',
      },
    ],
  },
};

export default AGB_CONTENT;
