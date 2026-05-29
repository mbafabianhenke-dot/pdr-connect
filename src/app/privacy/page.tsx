'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Wrench, ArrowLeft } from 'lucide-react';

const OPERATOR_BOX = {
  en: <><strong>Operator:</strong> Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus · VAT: CY60015676H<br /><strong>Platform:</strong> PDR Connect (pdrconnect.com)<br /><strong>Contact:</strong> <a href="mailto:info@cybratech-solutions.com" className="text-brand-600 underline">info@cybratech-solutions.com</a><br /><strong>Governing Law:</strong> Republic of Cyprus · GDPR (EU) 2016/679</>,
  de: <><strong>Betreiber:</strong> Cybratech-Solutions · Efesou 9, 5280 Paralimni, Zypern · USt-IdNr.: CY60015676H<br /><strong>Plattform:</strong> PDR Connect (pdrconnect.com)<br /><strong>Kontakt:</strong> <a href="mailto:info@cybratech-solutions.com" className="text-brand-600 underline">info@cybratech-solutions.com</a><br /><strong>Anwendbares Recht:</strong> Republik Zypern · DSGVO (EU) 2016/679</>,
  el: <><strong>Φορέας Εκμετάλλευσης:</strong> Cybratech-Solutions · Efesou 9, 5280 Παραλίμνι, Κύπρος · ΑΦΜ: CY60015676H<br /><strong>Πλατφόρμα:</strong> PDR Connect (pdrconnect.com)<br /><strong>Επικοινωνία:</strong> <a href="mailto:info@cybratech-solutions.com" className="text-brand-600 underline">info@cybratech-solutions.com</a><br /><strong>Εφαρμοστέο Δίκαιο:</strong> Κυπριακή Δημοκρατία · ΓΚΠΔ (ΕΕ) 2016/679</>,
  es: <><strong>Operador:</strong> Cybratech-Solutions · Efesou 9, 5280 Paralimni, Chipre · NIF: CY60015676H<br /><strong>Plataforma:</strong> PDR Connect (pdrconnect.com)<br /><strong>Contacto:</strong> <a href="mailto:info@cybratech-solutions.com" className="text-brand-600 underline">info@cybratech-solutions.com</a><br /><strong>Ley Aplicable:</strong> República de Chipre · RGPD (UE) 2016/679</>,
};

const CONTENT = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated',
    sections: [
      { h: '1. Who We Are', p: 'PDR Connect is a B2B matching platform operated by Cybratech-Solutions, a company registered in Cyprus. We connect automotive professionals including PDR technicians, car painters, preparers, and dismantlers worldwide.' },
      { h: '2. Data We Collect', list: ['Registration data: Full name, email address, phone number (optional), professional role, GDPR consent timestamp', 'Profile data: Biography, services offered, available countries, avatar photo', 'Identity documents: EU ID, A1 certificate, travel documents, company documents (stored securely)', 'Communication: Messages sent through the platform (monitored for platform rule compliance)', 'Payment data: Processed by Stripe; we store only the Stripe Customer ID and subscription status — no card data', 'Technical data: IP address, browser type, session cookies (for authentication)'] },
      { h: '3. How We Use Your Data', list: ['To provide and operate the PDR Connect platform', 'To verify your professional identity', 'To enable communication between verified premium members', 'To process subscription payments via Stripe', 'To enforce platform rules (including anti-bypass contact filtering)', 'To comply with legal obligations'] },
      { h: '4. What Is Never Displayed Publicly', p: 'Your email address and phone number are never shown in any public interface, search results, or messages. They are stored internally for account management only. Full names are visible only to Premium members.' },
      { h: '5. Legal Basis (GDPR)', list: ['Contract performance (Art. 6(1)(b)): Providing the service you signed up for', 'Consent (Art. 6(1)(a)): Processing identity documents, marketing communications', 'Legitimate interest (Art. 6(1)(f)): Platform security, fraud prevention, anti-bypass filtering', 'Legal obligation (Art. 6(1)(c)): Tax and compliance records'] },
      { h: '6. Your Rights Under GDPR', list: ['Right of access – Request a copy of your personal data', 'Right to rectification – Correct inaccurate data', 'Right to erasure – Request deletion of your account and data', 'Right to portability – Receive your data in machine-readable format', 'Right to object – Object to processing based on legitimate interest', 'Right to restrict processing – Limit how we use your data'] },
      { h: '7. Data Retention', p: 'Active accounts: data retained for the duration of membership. Deleted accounts: data anonymized within 30 days, except where legally required (e.g., payment records: 7 years). Identity documents: deleted within 90 days of account deletion.' },
      { h: '8. Data Sharing', p: 'We share data only with:', list: ['Stripe – Payment processing (privacy.stripe.com)', 'Supabase – Database and file storage (EU region)', 'Resend – Transactional email delivery', 'Vercel – Platform hosting (EU region)'], p2: 'We never sell your data to third parties.' },
      { h: '9. Cookies', p: 'We use strictly necessary cookies for authentication (Supabase session tokens). No tracking or advertising cookies are used.' },
      { h: '10. Contact & Complaints', p: 'Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus\nEmail: info@cybratech-solutions.com\nYou may also lodge a complaint with the Cyprus Commissioner for Personal Data Protection (dataprotection.gov.cy).' },
    ],
    links: { terms: 'Terms of Service', legal: 'Legal Notice', home: 'Back to Home' },
  },
  de: {
    title: 'Datenschutzerklärung',
    lastUpdated: 'Zuletzt aktualisiert',
    sections: [
      { h: '1. Wer wir sind', p: 'PDR Connect ist eine B2B-Matching-Plattform, betrieben von Cybratech-Solutions, einem in Zypern registrierten Unternehmen. Wir verbinden Kfz-Profis, darunter PDR-Techniker, Autolackierer, Aufbereiter und Demontierer, weltweit.' },
      { h: '2. Erhobene Daten', list: ['Registrierungsdaten: Vollständiger Name, E-Mail-Adresse, Telefonnummer (optional), Berufsrolle, DSGVO-Einwilligungszeitstempel', 'Profildaten: Biografie, angebotene Dienstleistungen, verfügbare Länder, Profilfoto', 'Identitätsdokumente: EU-Ausweis, A1-Bescheinigung, Reisedokumente, Unternehmensdokumente (sicher gespeichert)', 'Kommunikation: Über die Plattform gesendete Nachrichten (zur Einhaltung der Plattformregeln überwacht)', 'Zahlungsdaten: Verarbeitet von Stripe; wir speichern nur die Stripe-Kunden-ID und den Abonnementstatus — keine Kartendaten', 'Technische Daten: IP-Adresse, Browsertyp, Sitzungscookies (zur Authentifizierung)'] },
      { h: '3. Verwendung deiner Daten', list: ['Bereitstellung und Betrieb der PDR Connect-Plattform', 'Überprüfung deiner beruflichen Identität', 'Ermöglichung der Kommunikation zwischen verifizierten Premium-Mitgliedern', 'Verarbeitung von Abonnementzahlungen über Stripe', 'Durchsetzung von Plattformregeln (einschließlich Anti-Bypass-Kontaktfilterung)', 'Erfüllung gesetzlicher Pflichten'] },
      { h: '4. Was nie öffentlich angezeigt wird', p: 'Deine E-Mail-Adresse und Telefonnummer werden in keiner öffentlichen Benutzeroberfläche, keinen Suchergebnissen oder Nachrichten angezeigt. Sie werden intern nur für die Kontoverwaltung gespeichert. Vollständige Namen sind nur für Premium-Mitglieder sichtbar.' },
      { h: '5. Rechtsgrundlage (DSGVO)', list: ['Vertragserfüllung (Art. 6(1)(b)): Erbringung des von dir gebuchten Dienstes', 'Einwilligung (Art. 6(1)(a)): Verarbeitung von Identitätsdokumenten, Marketingkommunikation', 'Berechtigtes Interesse (Art. 6(1)(f)): Plattformsicherheit, Betrugsprävention, Anti-Bypass-Filterung', 'Rechtliche Verpflichtung (Art. 6(1)(c)): Steuer- und Compliance-Aufzeichnungen'] },
      { h: '6. Deine Rechte nach der DSGVO', list: ['Auskunftsrecht – Kopie deiner personenbezogenen Daten anfordern', 'Recht auf Berichtigung – Unrichtige Daten korrigieren', 'Recht auf Löschung – Löschung deines Kontos und deiner Daten beantragen', 'Recht auf Datenübertragbarkeit – Daten in maschinenlesbarem Format erhalten', 'Widerspruchsrecht – Widerspruch gegen die Verarbeitung auf Basis berechtigter Interessen', 'Recht auf Einschränkung – Nutzung deiner Daten einschränken'] },
      { h: '7. Datenspeicherung', p: 'Aktive Konten: Daten werden für die Dauer der Mitgliedschaft gespeichert. Gelöschte Konten: Daten werden innerhalb von 30 Tagen anonymisiert, es sei denn, gesetzliche Aufbewahrungspflichten gelten (z.B. Zahlungsaufzeichnungen: 7 Jahre). Identitätsdokumente: innerhalb von 90 Tagen nach Kontolöschung gelöscht.' },
      { h: '8. Datenweitergabe', p: 'Wir geben Daten nur weiter an:', list: ['Stripe – Zahlungsabwicklung (privacy.stripe.com)', 'Supabase – Datenbank und Dateispeicherung (EU-Region)', 'Resend – Transaktionale E-Mail-Zustellung', 'Vercel – Plattform-Hosting (EU-Region)'], p2: 'Wir verkaufen deine Daten niemals an Dritte.' },
      { h: '9. Cookies', p: 'Wir verwenden ausschließlich notwendige Cookies für die Authentifizierung (Supabase-Sitzungstoken). Es werden keine Tracking- oder Werbe-Cookies verwendet.' },
      { h: '10. Kontakt & Beschwerden', p: 'Cybratech-Solutions · Efesou 9, 5280 Paralimni, Zypern\nE-Mail: info@cybratech-solutions.com\nDu kannst auch eine Beschwerde beim Beauftragten für den Schutz personenbezogener Daten Zyperns einreichen (dataprotection.gov.cy).' },
    ],
    links: { terms: 'Nutzungsbedingungen', legal: 'Impressum', home: 'Zur Startseite' },
  },
  el: {
    title: 'Πολιτική Απορρήτου',
    lastUpdated: 'Τελευταία ενημέρωση',
    sections: [
      { h: '1. Ποιοι Είμαστε', p: 'Το PDR Connect είναι μια B2B πλατφόρμα αντιστοίχισης που λειτουργεί από την Cybratech-Solutions, εταιρεία εγγεγραμμένη στην Κύπρο. Συνδέουμε επαγγελματίες αυτοκινήτων, συμπεριλαμβανομένων τεχνικών PDR, βαφέων αυτοκινήτων, προετοιμαστών και αποσυναρμολογητών παγκοσμίως.' },
      { h: '2. Δεδομένα που Συλλέγουμε', list: ['Δεδομένα εγγραφής: Πλήρες όνομα, διεύθυνση email, αριθμός τηλεφώνου (προαιρετικό), επαγγελματικός ρόλος, χρονοσφραγίδα συναίνεσης ΓΚΠΔ', 'Δεδομένα προφίλ: Βιογραφικό, προσφερόμενες υπηρεσίες, διαθέσιμες χώρες, φωτογραφία', 'Έγγραφα ταυτότητας: Ταυτότητα ΕΕ, πιστοποιητικό Α1, ταξιδιωτικά έγγραφα, εταιρικά έγγραφα (αποθηκεύονται με ασφάλεια)', 'Επικοινωνία: Μηνύματα που αποστέλλονται μέσω της πλατφόρμας (παρακολουθούνται για συμμόρφωση με τους κανόνες)', 'Δεδομένα πληρωμής: Επεξεργάζονται από τη Stripe· αποθηκεύουμε μόνο το Stripe Customer ID και την κατάσταση συνδρομής', 'Τεχνικά δεδομένα: Διεύθυνση IP, τύπος προγράμματος περιήγησης, cookies συνεδρίας (για αυθεντικοποίηση)'] },
      { h: '3. Χρήση των Δεδομένων σας', list: ['Παροχή και λειτουργία της πλατφόρμας PDR Connect', 'Επαλήθευση της επαγγελματικής σας ταυτότητας', 'Ενεργοποίηση επικοινωνίας μεταξύ επαληθευμένων Premium μελών', 'Επεξεργασία πληρωμών συνδρομής μέσω Stripe', 'Επιβολή κανόνων πλατφόρμας (συμπεριλαμβανομένου φιλτραρίσματος επικοινωνίας)', 'Συμμόρφωση με νομικές υποχρεώσεις'] },
      { h: '4. Τι Δεν Εμφανίζεται Ποτέ Δημόσια', p: 'Η διεύθυνση email και ο αριθμός τηλεφώνου σας δεν εμφανίζονται ποτέ σε καμία δημόσια διεπαφή, αποτελέσματα αναζήτησης ή μηνύματα. Αποθηκεύονται εσωτερικά μόνο για διαχείριση λογαριασμού. Τα πλήρη ονόματα είναι ορατά μόνο στα Premium μέλη.' },
      { h: '5. Νομική Βάση (ΓΚΠΔ)', list: ['Εκτέλεση σύμβασης (Άρθρο 6(1)(β)): Παροχή της υπηρεσίας που εγγραφήκατε', 'Συναίνεση (Άρθρο 6(1)(α)): Επεξεργασία εγγράφων ταυτότητας, επικοινωνία μάρκετινγκ', 'Έννομο συμφέρον (Άρθρο 6(1)(στ)): Ασφάλεια πλατφόρμας, πρόληψη απάτης, φιλτράρισμα', 'Νομική υποχρέωση (Άρθρο 6(1)(γ)): Φορολογικά και αρχεία συμμόρφωσης'] },
      { h: '6. Τα Δικαιώματά σας βάσει ΓΚΠΔ', list: ['Δικαίωμα πρόσβασης – Αίτηση αντιγράφου των προσωπικών σας δεδομένων', 'Δικαίωμα διόρθωσης – Διόρθωση ανακριβών δεδομένων', 'Δικαίωμα διαγραφής – Αίτηση διαγραφής λογαριασμού και δεδομένων', 'Δικαίωμα φορητότητας – Λήψη δεδομένων σε αναγνώσιμη μορφή', 'Δικαίωμα εναντίωσης – Εναντίωση στην επεξεργασία βάσει έννομου συμφέροντος', 'Δικαίωμα περιορισμού – Περιορισμός χρήσης δεδομένων'] },
      { h: '7. Διατήρηση Δεδομένων', p: 'Ενεργοί λογαριασμοί: τα δεδομένα διατηρούνται για τη διάρκεια της συνδρομής. Διαγραμμένοι λογαριασμοί: ανωνυμοποίηση εντός 30 ημερών, εκτός όπου ισχύουν νομικές υποχρεώσεις (π.χ. αρχεία πληρωμών: 7 χρόνια). Έγγραφα ταυτότητας: διαγράφονται εντός 90 ημερών από τη διαγραφή λογαριασμού.' },
      { h: '8. Κοινοποίηση Δεδομένων', p: 'Κοινοποιούμε δεδομένα μόνο σε:', list: ['Stripe – Επεξεργασία πληρωμών (privacy.stripe.com)', 'Supabase – Βάση δεδομένων και αποθήκευση αρχείων (περιοχή ΕΕ)', 'Resend – Παράδοση συναλλακτικών email', 'Vercel – Φιλοξενία πλατφόρμας (περιοχή ΕΕ)'], p2: 'Δεν πωλούμε ποτέ τα δεδομένα σας σε τρίτους.' },
      { h: '9. Cookies', p: 'Χρησιμοποιούμε αποκλειστικά απαραίτητα cookies για αυθεντικοποίηση (tokens συνεδρίας Supabase). Δεν χρησιμοποιούνται cookies παρακολούθησης ή διαφήμισης.' },
      { h: '10. Επικοινωνία & Καταγγελίες', p: 'Cybratech-Solutions · Efesou 9, 5280 Παραλίμνι, Κύπρος\nEmail: info@cybratech-solutions.com\nΜπορείτε επίσης να υποβάλετε καταγγελία στον Επίτροπο Προστασίας Δεδομένων Προσωπικού Χαρακτήρα Κύπρου (dataprotection.gov.cy).' },
    ],
    links: { terms: 'Όροι Χρήσης', legal: 'Νομική Σημείωση', home: 'Επιστροφή στην Αρχική' },
  },
  es: {
    title: 'Política de Privacidad',
    lastUpdated: 'Última actualización',
    sections: [
      { h: '1. Quiénes Somos', p: 'PDR Connect es una plataforma de matching B2B operada por Cybratech-Solutions, una empresa registrada en Chipre. Conectamos a profesionales del automóvil, incluyendo técnicos PDR, pintores de coches, preparadores y desguazadores en todo el mundo.' },
      { h: '2. Datos que Recopilamos', list: ['Datos de registro: Nombre completo, dirección de email, número de teléfono (opcional), rol profesional, marca de tiempo del consentimiento RGPD', 'Datos de perfil: Biografía, servicios ofrecidos, países disponibles, foto de avatar', 'Documentos de identidad: DNI/NIE de la UE, certificado A1, documentos de viaje, documentos de empresa (almacenados de forma segura)', 'Comunicación: Mensajes enviados a través de la plataforma (monitoreados para cumplimiento de normas)', 'Datos de pago: Procesados por Stripe; solo almacenamos el ID de Cliente de Stripe y el estado de suscripción — sin datos de tarjeta', 'Datos técnicos: Dirección IP, tipo de navegador, cookies de sesión (para autenticación)'] },
      { h: '3. Cómo Usamos sus Datos', list: ['Para proporcionar y operar la plataforma PDR Connect', 'Para verificar su identidad profesional', 'Para facilitar la comunicación entre miembros Premium verificados', 'Para procesar pagos de suscripción a través de Stripe', 'Para aplicar las normas de la plataforma (incluido el filtrado anti-bypass)', 'Para cumplir con las obligaciones legales'] },
      { h: '4. Lo que Nunca se Muestra Públicamente', p: 'Su dirección de email y número de teléfono nunca se muestran en ninguna interfaz pública, resultados de búsqueda ni mensajes. Se almacenan internamente solo para la gestión de la cuenta. Los nombres completos solo son visibles para los miembros Premium.' },
      { h: '5. Base Legal (RGPD)', list: ['Ejecución de contrato (Art. 6(1)(b)): Prestación del servicio al que se registró', 'Consentimiento (Art. 6(1)(a)): Procesamiento de documentos de identidad, comunicaciones de marketing', 'Interés legítimo (Art. 6(1)(f)): Seguridad de la plataforma, prevención de fraude, filtrado anti-bypass', 'Obligación legal (Art. 6(1)(c)): Registros fiscales y de cumplimiento'] },
      { h: '6. Sus Derechos bajo el RGPD', list: ['Derecho de acceso – Solicitar una copia de sus datos personales', 'Derecho de rectificación – Corregir datos inexactos', 'Derecho de supresión – Solicitar la eliminación de su cuenta y datos', 'Derecho de portabilidad – Recibir sus datos en formato legible por máquina', 'Derecho de oposición – Oponerse al tratamiento basado en interés legítimo', 'Derecho a la limitación – Limitar cómo usamos sus datos'] },
      { h: '7. Retención de Datos', p: 'Cuentas activas: datos retenidos durante la duración de la membresía. Cuentas eliminadas: datos anonimizados en 30 días, excepto cuando sea legalmente requerido (p.ej., registros de pago: 7 años). Documentos de identidad: eliminados en 90 días tras la eliminación de la cuenta.' },
      { h: '8. Compartición de Datos', p: 'Compartimos datos únicamente con:', list: ['Stripe – Procesamiento de pagos (privacy.stripe.com)', 'Supabase – Base de datos y almacenamiento de archivos (región UE)', 'Resend – Entrega de correo electrónico transaccional', 'Vercel – Alojamiento de la plataforma (región UE)'], p2: 'Nunca vendemos sus datos a terceros.' },
      { h: '9. Cookies', p: 'Utilizamos únicamente cookies estrictamente necesarias para la autenticación (tokens de sesión de Supabase). No se utilizan cookies de seguimiento ni publicidad.' },
      { h: '10. Contacto y Reclamaciones', p: 'Cybratech-Solutions · Efesou 9, 5280 Paralimni, Chipre\nCorreo: info@cybratech-solutions.com\nTambién puede presentar una reclamación ante el Comisionado de Protección de Datos Personal de Chipre (dataprotection.gov.cy).' },
    ],
    links: { terms: 'Términos de Servicio', legal: 'Aviso Legal', home: 'Volver al Inicio' },
  },
};

type Lang = keyof typeof CONTENT;

export default function PrivacyPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split('-')[0] as Lang) in CONTENT
    ? (i18n.language?.split('-')[0] as Lang)
    : 'en';
  const c = CONTENT[lang];
  const op = OPERATOR_BOX[lang];

  const dateStr = new Date().toLocaleDateString(
    lang === 'de' ? 'de-DE' : lang === 'el' ? 'el-GR' : lang === 'es' ? 'es-ES' : 'en-GB',
    { day: '2-digit', month: 'long', year: 'numeric' }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-brand-600" />
            <span className="font-bold text-gray-900">PDR Connect</span>
          </Link>
          <Link href="/" className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> {c.links.home}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="card prose prose-sm max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{c.title}</h1>
          <p className="text-gray-500 mb-8">{c.lastUpdated}: {dateStr}</p>

          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-8 not-prose">
            <p className="text-sm text-brand-700">{op}</p>
          </div>

          {c.sections.map((s: any) => (
            <div key={s.h}>
              <h2>{s.h}</h2>
              {s.p && <p>{s.p}</p>}
              {s.list && (
                <ul>
                  {s.list.map((item: string) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {s.p2 && <p>{s.p2}</p>}
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-sm text-gray-400">
        <div className="flex justify-center gap-6">
          <Link href="/terms" className="hover:text-gray-600">{c.links.terms}</Link>
          <Link href="/legal" className="hover:text-gray-600">{c.links.legal}</Link>
          <Link href="/" className="hover:text-gray-600">{c.links.home}</Link>
        </div>
      </footer>
    </div>
  );
}
