'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LegalPageHeader from '@/components/LegalPageHeader';

const OPERATOR_TABLE = [
  { en: 'Company',         de: 'Unternehmen',          el: 'Εταιρεία',                es: 'Empresa',             value: 'Cybratech-Solutions' },
  { en: 'Address',         de: 'Adresse',               el: 'Διεύθυνση',               es: 'Dirección',           value: 'Efesou 9, 5280 Paralimni, Cyprus' },
  { en: 'Email',           de: 'E-Mail',                el: 'Email',                   es: 'Correo',              value: 'info@cybratech-solutions.com' },
  { en: 'VAT Number',      de: 'USt-IdNr.',             el: 'ΑΦΜ',                     es: 'NIF',                 value: 'CY60015676H' },
  { en: 'Platform',        de: 'Plattform',             el: 'Πλατφόρμα',               es: 'Plataforma',          value: 'PDR Connect' },
  { en: 'Platform URL',    de: 'Plattform-URL',         el: 'URL Πλατφόρμας',          es: 'URL de la Plataforma', value: 'pdrconnect.com' },
  { en: 'Registered in',   de: 'Registriert in',        el: 'Εγγεγραμμένη σε',         es: 'Registrada en',       value: 'Republic of Cyprus' },
  { en: 'Governing law',   de: 'Geltendes Recht',       el: 'Εφαρμοστέο Δίκαιο',       es: 'Ley Aplicable',       value: 'Republic of Cyprus' },
  { en: 'Jurisdiction',    de: 'Gerichtsstand',         el: 'Δικαιοδοσία',             es: 'Jurisdicción',        value: 'Courts of Nicosia, Cyprus' },
];

const CONTENT = {
  en: {
    title: 'Legal Notice / Impressum',
    subtitle: 'Pursuant to applicable transparency and information obligations',
    operatorTitle: 'Operator Information',
    sections: [
      { h: 'Platform Description', p: 'PDR Connect is an online B2B matching platform for automotive professionals. It enables verified PDR technicians, car painters, preparers, and dismantlers to connect professionally worldwide. The platform is operated exclusively for commercial B2B purposes.' },
      { h: 'Disclaimer of Liability', p: 'The operator of PDR Connect is not responsible for the accuracy of user-submitted professional information, the quality of services exchanged between users, or outcomes of professional relationships formed through the platform. The operator acts solely as an intermediary.' },
      { h: 'Intellectual Property', p: 'All platform design, software, branding, and content created by Cybratech-Solutions are protected by copyright. Unauthorized reproduction or distribution is prohibited. User-submitted content remains the property of the respective user.' },
      { h: 'Applicable Law', p: 'This platform and all agreements relating to it are governed exclusively by the laws of the Republic of Cyprus. Any disputes arising from the use of PDR Connect shall be brought before the competent courts of Nicosia, Cyprus.' },
      { h: 'Contact', p: 'For all legal, data protection, or compliance inquiries, please write to:\nCybratech-Solutions\nEfesou 9, 5280 Paralimni\nCyprus\nEmail: info@cybratech-solutions.com' },
      { h: 'GDPR / Data Protection Authority', p: 'The competent supervisory authority for data protection in Cyprus is:\nCommissioner for Personal Data Protection\n1 Iasonos Street, 1082 Nicosia, Cyprus\nWebsite: dataprotection.gov.cy' },
    ],
    links: { privacy: 'Privacy Policy', terms: 'Terms of Service', home: 'Back to Home' },
  },
  de: {
    title: 'Impressum / Rechtliche Hinweise',
    subtitle: 'Gemäß geltenden Transparenz- und Informationspflichten',
    operatorTitle: 'Betreiberinformationen',
    sections: [
      { h: 'Plattformbeschreibung', p: 'PDR Connect ist eine Online-B2B-Matching-Plattform für Kfz-Profis. Sie ermöglicht verifizierten PDR-Technikern, Autolackierern, Aufbereitern und Demonteuren, weltweit professionell zu vernetzen. Die Plattform wird ausschließlich für kommerzielle B2B-Zwecke betrieben.' },
      { h: 'Haftungsausschluss', p: 'Der Betreiber von PDR Connect ist nicht verantwortlich für die Richtigkeit der von Nutzern eingereichten Berufsangaben, die Qualität der zwischen Nutzern ausgetauschten Dienstleistungen oder die Ergebnisse beruflicher Beziehungen, die über die Plattform entstanden sind. Der Betreiber handelt ausschließlich als Vermittler.' },
      { h: 'Geistiges Eigentum', p: 'Alle von Cybratech-Solutions erstellten Plattformdesigns, Software, Marken und Inhalte sind urheberrechtlich geschützt. Unerlaubte Vervielfältigung oder Verbreitung ist untersagt. Von Nutzern eingereichte Inhalte bleiben Eigentum des jeweiligen Nutzers.' },
      { h: 'Anwendbares Recht', p: 'Diese Plattform und alle damit zusammenhängenden Vereinbarungen unterliegen ausschließlich dem Recht der Republik Zypern. Alle Streitigkeiten, die sich aus der Nutzung von PDR Connect ergeben, sind vor den zuständigen Gerichten in Nikosia, Zypern, zu klären.' },
      { h: 'Kontakt', p: 'Für alle rechtlichen, datenschutzrechtlichen oder Compliance-Anfragen wenden Sie sich bitte an:\nCybratech-Solutions\nEfesou 9, 5280 Paralimni\nZypern\nE-Mail: info@cybratech-solutions.com' },
      { h: 'DSGVO / Datenschutzbehörde', p: 'Die zuständige Aufsichtsbehörde für den Datenschutz in Zypern ist:\nBeauftragter für den Schutz personenbezogener Daten\n1 Iasonos Street, 1082 Nikosia, Zypern\nWebsite: dataprotection.gov.cy' },
    ],
    links: { privacy: 'Datenschutzerklärung', terms: 'Nutzungsbedingungen', home: 'Zur Startseite' },
  },
  el: {
    title: 'Νομική Σημείωση',
    subtitle: 'Σύμφωνα με τις ισχύουσες υποχρεώσεις διαφάνειας και πληροφόρησης',
    operatorTitle: 'Πληροφορίες Φορέα Εκμετάλλευσης',
    sections: [
      { h: 'Περιγραφή Πλατφόρμας', p: 'Το PDR Connect είναι μια διαδικτυακή B2B πλατφόρμα αντιστοίχισης για επαγγελματίες αυτοκινήτων. Επιτρέπει σε επαληθευμένους τεχνικούς PDR, βαφείς αυτοκινήτων, προετοιμαστές και αποσυναρμολογητές να συνδέονται επαγγελματικά παγκοσμίως. Η πλατφόρμα λειτουργεί αποκλειστικά για εμπορικούς B2B σκοπούς.' },
      { h: 'Αποποίηση Ευθύνης', p: 'Ο φορέας εκμετάλλευσης του PDR Connect δεν ευθύνεται για την ακρίβεια των επαγγελματικών πληροφοριών που υποβάλλουν οι χρήστες, την ποιότητα των υπηρεσιών που ανταλλάσσονται μεταξύ χρηστών ή τα αποτελέσματα επαγγελματικών σχέσεων που δημιουργούνται μέσω της πλατφόρμας. Ο φορέας εκμετάλλευσης ενεργεί αποκλειστικά ως διαμεσολαβητής.' },
      { h: 'Πνευματική Ιδιοκτησία', p: 'Ολόκληρος ο σχεδιασμός πλατφόρμας, το λογισμικό, η επωνυμία και το περιεχόμενο που δημιουργήθηκαν από την Cybratech-Solutions προστατεύονται από πνευματικά δικαιώματα. Απαγορεύεται η μη εξουσιοδοτημένη αναπαραγωγή ή διανομή. Το περιεχόμενο που υποβάλλεται από χρήστες παραμένει ιδιοκτησία του αντίστοιχου χρήστη.' },
      { h: 'Εφαρμοστέο Δίκαιο', p: 'Η παρούσα πλατφόρμα και όλες οι συμφωνίες που σχετίζονται με αυτή διέπονται αποκλειστικά από τους νόμους της Κυπριακής Δημοκρατίας. Κάθε διαφορά που προκύπτει από τη χρήση του PDR Connect πρέπει να εκδικάζεται ενώπιον των αρμόδιων δικαστηρίων Λευκωσίας, Κύπρος.' },
      { h: 'Επικοινωνία', p: 'Για όλες τις νομικές, προστασίας δεδομένων ή ερωτήσεις συμμόρφωσης, παρακαλούμε γράψτε στη διεύθυνση:\nCybratech-Solutions\nEfesou 9, 5280 Παραλίμνι\nΚύπρος\nEmail: info@cybratech-solutions.com' },
      { h: 'ΓΚΠΔ / Αρχή Προστασίας Δεδομένων', p: 'Η αρμόδια εποπτική αρχή για την προστασία δεδομένων στην Κύπρο είναι:\nΕπίτροπος Προστασίας Δεδομένων Προσωπικού Χαρακτήρα\n1 Οδός Ιάσωνος, 1082 Λευκωσία, Κύπρος\nΙστότοπος: dataprotection.gov.cy' },
    ],
    links: { privacy: 'Πολιτική Απορρήτου', terms: 'Όροι Χρήσης', home: 'Επιστροφή στην Αρχική' },
  },
  es: {
    title: 'Aviso Legal',
    subtitle: 'De conformidad con las obligaciones de transparencia e información aplicables',
    operatorTitle: 'Información del Operador',
    sections: [
      { h: 'Descripción de la Plataforma', p: 'PDR Connect es una plataforma de matching B2B en línea para profesionales del automóvil. Permite a técnicos PDR, pintores de coches, preparadores y desguazadores verificados conectarse profesionalmente en todo el mundo. La plataforma opera exclusivamente con fines comerciales B2B.' },
      { h: 'Limitación de Responsabilidad', p: 'El operador de PDR Connect no es responsable de la exactitud de la información profesional enviada por los usuarios, la calidad de los servicios intercambiados entre usuarios, ni los resultados de las relaciones profesionales formadas a través de la plataforma. El operador actúa únicamente como intermediario.' },
      { h: 'Propiedad Intelectual', p: 'Todo el diseño, software, marca y contenido creado por Cybratech-Solutions está protegido por derechos de autor. La reproducción o distribución no autorizada está prohibida. El contenido enviado por los usuarios sigue siendo propiedad del usuario respectivo.' },
      { h: 'Ley Aplicable', p: 'Esta plataforma y todos los acuerdos relacionados con ella se rigen exclusivamente por las leyes de la República de Chipre. Cualquier disputa que surja del uso de PDR Connect deberá presentarse ante los tribunales competentes de Nicosia, Chipre.' },
      { h: 'Contacto', p: 'Para todas las consultas legales, de protección de datos o cumplimiento, escriba a:\nCybratech-Solutions\nEfesou 9, 5280 Paralimni\nChipre\nCorreo: info@cybratech-solutions.com' },
      { h: 'RGPD / Autoridad de Protección de Datos', p: 'La autoridad supervisora competente en materia de protección de datos en Chipre es:\nComisionado de Protección de Datos Personales\n1 Calle Iasonos, 1082 Nicosia, Chipre\nSitio web: dataprotection.gov.cy' },
    ],
    links: { privacy: 'Política de Privacidad', terms: 'Términos de Servicio', home: 'Volver al Inicio' },
  },
};

type Lang = keyof typeof CONTENT;

export default function LegalPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split('-')[0] as Lang) in CONTENT
    ? (i18n.language?.split('-')[0] as Lang)
    : 'en';
  const c = CONTENT[lang];

  return (
    <div className="min-h-screen bg-gray-50">
      <LegalPageHeader
        variant="legal"
        backHref="/"
        backLabel={c.links.home}
        subtitle={c.subtitle}
      />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="card prose prose-sm max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{c.title}</h1>
          <p className="text-gray-500 mb-8">{c.subtitle}</p>

          <h2>{c.operatorTitle}</h2>
          <div className="bg-gray-50 rounded-xl p-6 not-prose">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-200">
                {OPERATOR_TABLE.map((row) => (
                  <tr key={row.en}>
                    <td className="py-2 pr-4 font-semibold text-gray-700 w-40">{row[lang]}</td>
                    <td className="py-2 text-gray-600">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {c.sections.map((s: any) => (
            <div key={s.h}>
              <h2>{s.h}</h2>
              <p style={{ whiteSpace: 'pre-line' }}>{s.p}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-sm text-gray-400">
        <div className="flex justify-center gap-6">
          <Link href="/privacy" className="hover:text-gray-600">{c.links.privacy}</Link>
          <Link href="/terms" className="hover:text-gray-600">{c.links.terms}</Link>
          <Link href="/" className="hover:text-gray-600">{c.links.home}</Link>
        </div>
      </footer>
    </div>
  );
}
