import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? 'hello@pdrconnect.eu';
const OPERATOR = 'PDR Connect by Cybratech-Solutions';

type Lang = 'en' | 'de' | 'es' | 'el';
function normLang(lang?: string | null): Lang {
  const l = (lang ?? 'en').split('-')[0];
  return (['en', 'de', 'es', 'el'] as Lang[]).includes(l as Lang) ? (l as Lang) : 'en';
}

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: `${OPERATOR} <${FROM}>`,
    to,
    subject: 'Welcome to PDR Connect',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1d4ed8;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0">PDR Connect</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2>Welcome, ${name}!</h2>
          <p>Your account has been created. The next step is to upload your verification documents so our team can verify your profile.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/documents" style="display:inline-block;background:#1d4ed8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
            Upload Documents
          </a>
          <p style="color:#6b7280;font-size:14px">Operated by Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus<br><a href="mailto:info@cybratech-solutions.com" style="color:#6b7280">info@cybratech-solutions.com</a></p>
        </div>
      </div>
    `,
  });
}

export async function sendVerificationApprovedEmail(to: string, name: string) {
  return resend.emails.send({
    from: `${OPERATOR} <${FROM}>`,
    to,
    subject: '✅ Your PDR Connect profile is verified!',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#16a34a;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0">Profile Verified ✅</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2>Congratulations, ${name}!</h2>
          <p>Your identity has been verified. Your profile is now visible to other professionals on PDR Connect.</p>
          <p>To unlock messaging and full name visibility, consider upgrading to Premium.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/premium" style="display:inline-block;background:#f59e0b;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
            Upgrade to Premium — €9.99/month
          </a>
          <p style="color:#6b7280;font-size:14px">Operated by Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus<br><a href="mailto:info@cybratech-solutions.com" style="color:#6b7280">info@cybratech-solutions.com</a></p>
        </div>
      </div>
    `,
  });
}

export async function sendVerificationRequestAdminEmail(
  adminEmail: string,
  user: {
    full_name: string; email: string; phone?: string; role: string; created_at: string;
    company_name?: string; company_street?: string; company_house_number?: string;
    company_zip?: string; company_country?: string; vat_id?: string;
  }
) {
  const address = [
    user.company_street && user.company_house_number
      ? `${user.company_street} ${user.company_house_number}` : null,
    user.company_zip, user.company_country,
  ].filter(Boolean).join(', ') || '—';

  return resend.emails.send({
    from: `${OPERATOR} <${FROM}>`,
    to: adminEmail,
    subject: `🔔 Verifizierungsanfrage — ${user.full_name} (${user.company_name ?? '—'})`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#dc2626;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0">PDR Connect — Verifizierungsanfrage</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin-bottom:24px">
            <p style="margin:0;color:#991b1b;font-size:14px;font-weight:600">
              🔔 Ein Nutzer hat das Onboarding abgeschlossen und wartet auf Ihre Freigabe.
            </p>
          </div>
          <h2 style="color:#111827;margin-top:0">Kontaktdaten</h2>
          <table style="width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14px">
            <tr style="background:#f9fafb"><td style="padding:10px 12px;font-weight:600;color:#374151;width:140px">Ansprechpartner</td><td style="padding:10px 12px;border-left:1px solid #e5e7eb;color:#111827">${user.full_name}</td></tr>
            <tr style="background:#fff"><td style="padding:10px 12px;font-weight:600;color:#374151;border-top:1px solid #e5e7eb">E-Mail</td><td style="padding:10px 12px;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;color:#111827"><a href="mailto:${user.email}" style="color:#1d4ed8">${user.email}</a></td></tr>
            <tr style="background:#f9fafb"><td style="padding:10px 12px;font-weight:600;color:#374151;border-top:1px solid #e5e7eb">Telefon</td><td style="padding:10px 12px;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;color:#111827">${user.phone ?? '—'}</td></tr>
            <tr style="background:#fff"><td style="padding:10px 12px;font-weight:600;color:#374151;border-top:1px solid #e5e7eb">Rolle</td><td style="padding:10px 12px;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;color:#111827">${user.role}</td></tr>
          </table>
          <h2 style="color:#111827">Firmendaten</h2>
          <table style="width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14px">
            <tr style="background:#f9fafb"><td style="padding:10px 12px;font-weight:600;color:#374151;width:140px">Firmenname</td><td style="padding:10px 12px;border-left:1px solid #e5e7eb;color:#111827">${user.company_name ?? '—'}</td></tr>
            <tr style="background:#fff"><td style="padding:10px 12px;font-weight:600;color:#374151;border-top:1px solid #e5e7eb">Adresse</td><td style="padding:10px 12px;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;color:#111827">${address}</td></tr>
            <tr style="background:#f9fafb"><td style="padding:10px 12px;font-weight:600;color:#374151;border-top:1px solid #e5e7eb">USt-IdNr.</td><td style="padding:10px 12px;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;color:#111827;font-family:monospace">${user.vat_id ?? '—'}</td></tr>
            <tr style="background:#fff"><td style="padding:10px 12px;font-weight:600;color:#374151;border-top:1px solid #e5e7eb">Registriert</td><td style="padding:10px 12px;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;color:#111827">${new Date(user.created_at).toLocaleString('de-DE')}</td></tr>
          </table>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="display:inline-block;background:#dc2626;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">
            → Jetzt im Admin-Panel prüfen &amp; freigeben
          </a>
          <p style="color:#9ca3af;font-size:13px;margin-top:24px">PDR Connect · Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus<br>
          <a href="mailto:info@cybratech-solutions.com" style="color:#9ca3af">info@cybratech-solutions.com</a></p>
        </div>
      </div>
    `,
  });
}

export async function sendVerificationRejectedEmail(to: string, name: string, lang?: string) {
  const l = normLang(lang);
  const c = ({
    en: {
      subject: 'PDR Connect — Note on your verification request',
      greeting: `Hello ${name},`,
      body1: 'Thank you for your verification request. Unfortunately, we were unable to verify your profile at this time.',
      body2: 'This may be due to incomplete or unclear documents. Please ensure your documents (EU ID / passport) are clear and valid, then submit a new request.',
      btn: 'Update Documents',
      body3: 'If you have any questions, please do not hesitate to contact us.',
      op: 'Operated by Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus',
    },
    de: {
      subject: 'PDR Connect — Hinweis zu Ihrer Verifizierungsanfrage',
      greeting: `Hallo ${name},`,
      body1: 'Vielen Dank für Ihre Verifizierungsanfrage. Leider konnten wir Ihr Profil derzeit nicht verifizieren.',
      body2: 'Dies kann auf unvollständige oder unklare Dokumente zurückzuführen sein. Bitte stellen Sie sicher, dass Ihre Dokumente (EU-Ausweis / Reisepass) klar und gültig sind, und stellen Sie anschließend eine neue Anfrage.',
      btn: 'Dokumente aktualisieren',
      body3: 'Bei Fragen stehen wir Ihnen gerne zur Verfügung.',
      op: 'Betrieben von Cybratech-Solutions · Efesou 9, 5280 Paralimni, Zypern',
    },
    es: {
      subject: 'PDR Connect — Nota sobre tu solicitud de verificación',
      greeting: `Hola ${name},`,
      body1: 'Gracias por tu solicitud de verificación. Desafortunadamente, no pudimos verificar tu perfil en este momento.',
      body2: 'Esto puede deberse a documentos incompletos o poco claros. Por favor asegúrate de que tus documentos (DNI de la UE / pasaporte) sean claros y válidos, y envía una nueva solicitud.',
      btn: 'Actualizar documentos',
      body3: 'Si tienes alguna pregunta, no dudes en contactarnos.',
      op: 'Operado por Cybratech-Solutions · Efesou 9, 5280 Paralimni, Chipre',
    },
    el: {
      subject: 'PDR Connect — Σημείωση για το αίτημα επαλήθευσής σας',
      greeting: `Γεια σας ${name},`,
      body1: 'Σας ευχαριστούμε για το αίτημα επαλήθευσής σας. Δυστυχώς, δεν μπορέσαμε να επαληθεύσουμε το προφίλ σας αυτή τη στιγμή.',
      body2: 'Αυτό μπορεί να οφείλεται σε ελλιπή ή ασαφή έγγραφα. Βεβαιωθείτε ότι τα έγγραφά σας (ταυτότητα ΕΕ / διαβατήριο) είναι σαφή και έγκυρα, και υποβάλετε νέο αίτημα.',
      btn: 'Ενημέρωση εγγράφων',
      body3: 'Εάν έχετε οποιεσδήποτε ερωτήσεις, μη διστάσετε να επικοινωνήσετε μαζί μας.',
      op: 'Λειτουργεί από την Cybratech-Solutions · Efesou 9, 5280 Paralimni, Κύπρος',
    },
  } as Record<Lang, { subject:string; greeting:string; body1:string; body2:string; btn:string; body3:string; op:string }>)[l];

  return resend.emails.send({
    from: `${OPERATOR} <${FROM}>`,
    to,
    subject: c.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1d4ed8;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0">PDR Connect</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin-top:0">${c.greeting}</h2>
          <p style="color:#374151">${c.body1}</p>
          <p style="color:#374151">${c.body2}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/documents" style="display:inline-block;background:#1d4ed8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
            ${c.btn}
          </a>
          <p style="color:#374151">${c.body3}</p>
          <p style="color:#9ca3af;font-size:13px;margin-top:24px">${c.op}<br>
          <a href="mailto:info@cybratech-solutions.com" style="color:#9ca3af">info@cybratech-solutions.com</a></p>
        </div>
      </div>
    `,
  });
}

export async function sendNewRegistrationAdminEmail(
  adminEmail: string,
  user: { full_name: string; email: string; phone?: string; role: string; created_at: string }
) {
  return resend.emails.send({
    from: `${OPERATOR} <${FROM}>`,
    to: adminEmail,
    subject: `🆕 Neue Registrierung — ${user.full_name} (Freigabe erforderlich)`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1d4ed8;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0">PDR Connect — Neue Registrierung</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:20px">
            <p style="margin:0;color:#92400e;font-size:14px;font-weight:600">
              ⚠️ Dieses Konto wartet auf Ihre Freigabe. Bis zur Genehmigung hat der Nutzer keinen Zugang zum Dashboard.
            </p>
          </div>
          <h2 style="color:#111827;margin-top:0">Neuer Nutzer registriert</h2>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
            <tr style="background:#f9fafb"><td style="padding:10px 12px;font-weight:600;color:#374151;width:130px">Name</td><td style="padding:10px 12px;border-left:1px solid #e5e7eb;color:#111827">${user.full_name}</td></tr>
            <tr style="background:#fff"><td style="padding:10px 12px;font-weight:600;color:#374151;border-top:1px solid #e5e7eb">E-Mail</td><td style="padding:10px 12px;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;color:#111827"><a href="mailto:${user.email}" style="color:#1d4ed8">${user.email}</a></td></tr>
            <tr style="background:#f9fafb"><td style="padding:10px 12px;font-weight:600;color:#374151;border-top:1px solid #e5e7eb">Telefon</td><td style="padding:10px 12px;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;color:#111827">${user.phone ?? '—'}</td></tr>
            <tr style="background:#fff"><td style="padding:10px 12px;font-weight:600;color:#374151;border-top:1px solid #e5e7eb">Rolle</td><td style="padding:10px 12px;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;color:#111827">${user.role}</td></tr>
            <tr style="background:#f9fafb"><td style="padding:10px 12px;font-weight:600;color:#374151;border-top:1px solid #e5e7eb">Registriert</td><td style="padding:10px 12px;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;color:#111827">${new Date(user.created_at).toLocaleString('de-DE')}</td></tr>
          </table>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="display:inline-block;background:#16a34a;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">
              ✅ Freigeben (Admin-Panel)
            </a>
          </div>
          <p style="color:#9ca3af;font-size:13px;margin-top:24px">PDR Connect · Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus<br>
          <a href="mailto:info@cybratech-solutions.com" style="color:#9ca3af">info@cybratech-solutions.com</a></p>
        </div>
      </div>
    `,
  });
}

export async function sendAccountApprovedEmail(to: string, name: string, lang?: string) {
  const l = normLang(lang);
  const c = ({
    en: {
      subject: '✅ Your PDR Connect account is approved!',
      header: 'Account Approved ✅',
      greeting: `Welcome, ${name}!`,
      body: 'Your account has been reviewed and approved by our admin team. You now have full access to PDR Connect.',
      btn: 'Go to Dashboard →',
      next: 'Next steps: Upload your documents to verify your profile and become visible to other professionals.',
      op: 'Operated by Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus',
    },
    de: {
      subject: '✅ Ihr Konto wurde freigegeben — Willkommen bei PDR Connect!',
      header: 'Konto freigegeben ✅',
      greeting: `Willkommen, ${name}!`,
      body: 'Ihr Konto wurde von unserem Admin-Team geprüft und freigegeben. Sie haben jetzt vollen Zugang zu PDR Connect.',
      btn: 'Jetzt zum Dashboard →',
      next: 'Nächste Schritte: Laden Sie Ihre Dokumente hoch, um Ihr Profil zu verifizieren und für andere sichtbar zu werden.',
      op: 'Betrieben von Cybratech-Solutions · Efesou 9, 5280 Paralimni, Zypern',
    },
    es: {
      subject: '✅ ¡Tu cuenta de PDR Connect ha sido aprobada!',
      header: 'Cuenta aprobada ✅',
      greeting: `¡Bienvenido/a, ${name}!`,
      body: 'Tu cuenta ha sido revisada y aprobada por nuestro equipo de administración. Ahora tienes acceso completo a PDR Connect.',
      btn: 'Ir al Dashboard →',
      next: 'Próximos pasos: Sube tus documentos para verificar tu perfil y ser visible para otros profesionales.',
      op: 'Operado por Cybratech-Solutions · Efesou 9, 5280 Paralimni, Chipre',
    },
    el: {
      subject: '✅ Ο λογαριασμός σας στο PDR Connect εγκρίθηκε!',
      header: 'Λογαριασμός εγκρίθηκε ✅',
      greeting: `Καλώς ήλθατε, ${name}!`,
      body: 'Ο λογαριασμός σας ελέγχθηκε και εγκρίθηκε από την ομάδα διαχείρισής μας. Έχετε πλέον πλήρη πρόσβαση στο PDR Connect.',
      btn: 'Μετάβαση στον Πίνακα Ελέγχου →',
      next: 'Επόμενα βήματα: Ανεβάστε τα έγγραφά σας για να επαληθεύσετε το προφίλ σας και να γίνετε ορατοί σε άλλους.',
      op: 'Λειτουργεί από την Cybratech-Solutions · Efesou 9, 5280 Paralimni, Κύπρος',
    },
  } as Record<Lang, { subject:string; header:string; greeting:string; body:string; btn:string; next:string; op:string }>)[l];

  return resend.emails.send({
    from: `${OPERATOR} <${FROM}>`,
    to,
    subject: c.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#16a34a;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0">${c.header}</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin-top:0">${c.greeting}</h2>
          <p style="color:#374151">${c.body}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#1d4ed8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
            ${c.btn}
          </a>
          <p style="color:#6b7280;font-size:14px;margin-top:16px">${c.next}</p>
          <p style="color:#9ca3af;font-size:13px;margin-top:24px">${c.op}<br>
          <a href="mailto:info@cybratech-solutions.com" style="color:#9ca3af">info@cybratech-solutions.com</a></p>
        </div>
      </div>
    `,
  });
}

export async function sendAccountDeletionConfirmationEmail(to: string, name: string, lang?: string) {
  const l = normLang(lang);
  const c = ({
    en: {
      subject: 'Your PDR Connect account has been deleted',
      greeting: `Hello ${name},`,
      body: 'Your account deletion request has been successfully processed. All your data — profile, documents, images and all content — has been permanently removed from the platform.',
      listTitle: 'What was deleted:',
      items: [
        'Profile data and personal information',
        'All uploaded documents and images',
        'Experiences, references and portfolio',
        'Offers and job requests',
        'Your user account',
      ],
      reregister: 'If you would like to register again with PDR Connect in the future, you are welcome to do so at any time.',
      thanks: 'Thank you for using PDR Connect. We wish you all the best!',
      op: 'Operated by Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus',
    },
    de: {
      subject: 'Ihr PDR Connect Konto wurde gelöscht',
      greeting: `Hallo ${name},`,
      body: 'Ihre Anfrage zur Kontolöschung wurde erfolgreich durchgeführt. Alle Ihre Daten — Profil, Dokumente, Bilder und sämtliche Inhalte — wurden unwiderruflich von der Plattform gelöscht.',
      listTitle: 'Was wurde gelöscht:',
      items: [
        'Profildaten und persönliche Informationen',
        'Alle hochgeladenen Dokumente und Bilder',
        'Erfahrungen, Referenzen und Portfolio',
        'Angebote und Jobanfragen',
        'Ihr Benutzerkonto',
      ],
      reregister: 'Falls Sie sich in Zukunft wieder bei PDR Connect registrieren möchten, sind Sie jederzeit willkommen.',
      thanks: 'Vielen Dank, dass Sie PDR Connect genutzt haben. Wir wünschen Ihnen alles Gute!',
      op: 'Betrieben von Cybratech-Solutions · Efesou 9, 5280 Paralimni, Zypern',
    },
    es: {
      subject: 'Tu cuenta de PDR Connect ha sido eliminada',
      greeting: `Hola ${name},`,
      body: 'Tu solicitud de eliminación de cuenta ha sido procesada exitosamente. Todos tus datos — perfil, documentos, imágenes y todo el contenido — han sido eliminados permanentemente de la plataforma.',
      listTitle: 'Qué fue eliminado:',
      items: [
        'Datos de perfil e información personal',
        'Todos los documentos e imágenes subidos',
        'Experiencias, referencias y portafolio',
        'Ofertas y solicitudes de trabajo',
        'Tu cuenta de usuario',
      ],
      reregister: 'Si en el futuro deseas registrarte de nuevo en PDR Connect, eres bienvenido/a en cualquier momento.',
      thanks: '¡Gracias por usar PDR Connect. Te deseamos todo lo mejor!',
      op: 'Operado por Cybratech-Solutions · Efesou 9, 5280 Paralimni, Chipre',
    },
    el: {
      subject: 'Ο λογαριασμός σας στο PDR Connect έχει διαγραφεί',
      greeting: `Γεια σας ${name},`,
      body: 'Το αίτημα διαγραφής λογαριασμού σας έχει υλοποιηθεί επιτυχώς. Όλα τα δεδομένα σας — προφίλ, έγγραφα, εικόνες και όλο το περιεχόμενο — έχουν αφαιρεθεί μόνιμα από την πλατφόρμα.',
      listTitle: 'Τι διαγράφηκε:',
      items: [
        'Δεδομένα προφίλ και προσωπικές πληροφορίες',
        'Όλα τα ανεβασμένα έγγραφα και εικόνες',
        'Εμπειρίες, αναφορές και χαρτοφυλάκιο',
        'Προσφορές και αιτήματα εργασίας',
        'Ο λογαριασμός χρήστη σας',
      ],
      reregister: 'Εάν θέλετε να εγγραφείτε ξανά στο PDR Connect στο μέλλον, είστε πάντα ευπρόσδεκτοι.',
      thanks: 'Σας ευχαριστούμε που χρησιμοποιήσατε το PDR Connect. Σας ευχόμαστε ό,τι καλύτερο!',
      op: 'Λειτουργεί από την Cybratech-Solutions · Efesou 9, 5280 Paralimni, Κύπρος',
    },
  } as Record<Lang, { subject:string; greeting:string; body:string; listTitle:string; items:string[]; reregister:string; thanks:string; op:string }>)[l];

  return resend.emails.send({
    from: `${OPERATOR} <${FROM}>`,
    to,
    subject: c.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#6b7280;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0">PDR Connect</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin-top:0">${c.greeting}</h2>
          <p style="color:#374151">${c.body}</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600">${c.listTitle}</p>
            ${c.items.map(item => `<p style="margin:4px 0;color:#374151;font-size:14px">• ${item}</p>`).join('')}
          </div>
          <p style="color:#374151">${c.reregister}</p>
          <p style="color:#374151">${c.thanks}</p>
          <p style="color:#9ca3af;font-size:13px;margin-top:24px">${c.op}<br>
          <a href="mailto:info@cybratech-solutions.com" style="color:#9ca3af">info@cybratech-solutions.com</a></p>
        </div>
      </div>
    `,
  });
}

const DOC_TYPE_LABELS: Record<string, string> = {
  EU_ID:         '🪪 EU-Ausweis / Reisepass',
  A1:            '📄 A1-Bescheinigung',
  TRAVEL_DOC:    '✈️ Reisedokument',
  COMPANY_DOC:   '🏢 Firmenunterlage',
  IDENTITY_DOC:  '🪪 Reisepass / EU-Ausweis',
  GALLERY_IMAGE: '🖼 Galeriebild',
  AVATAR:        '👤 Profilbild',
  WORK_VISA:     '🇦🇺 Work Visa (Australia)',
};

// Public download URLs for the Australia Subclass 400 invitation templates
// (stored in the public `visa-templates` Supabase Storage bucket).
const VISA_TEMPLATE_URLS = {
  adr: 'https://spmbtjynxbqpecgumadv.supabase.co/storage/v1/object/public/visa-templates/ADR-Subclass-400-Visa-Invitation-Template.docx',
  pdrTeam: 'https://spmbtjynxbqpecgumadv.supabase.co/storage/v1/object/public/visa-templates/PDR-Team-Visa-Invitation-Template.docx',
} as const;

export async function sendNewDocumentAdminEmail(
  adminEmail: string,
  user: { full_name: string; email: string; company_name?: string },
  docType: string,
) {
  const label = DOC_TYPE_LABELS[docType] ?? docType;
  const now   = new Date().toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  return resend.emails.send({
    from: `${OPERATOR} <${FROM}>`,
    to: adminEmail,
    subject: `📎 Neues Dokument zur Freigabe — ${label} von ${user.full_name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1d4ed8;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0">PDR Connect — Neues Dokument</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin-bottom:24px">
            <p style="margin:0;color:#1e40af;font-size:15px;font-weight:600">
              📎 Ein Nutzer hat ein neues Dokument hochgeladen, das Ihre Freigabe benötigt.
            </p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
            <tr style="background:#f9fafb">
              <td style="padding:10px 12px;font-weight:600;color:#374151;width:140px">Nutzer</td>
              <td style="padding:10px 12px;border-left:1px solid #e5e7eb;color:#111827">${user.full_name}</td>
            </tr>
            <tr style="background:#fff">
              <td style="padding:10px 12px;font-weight:600;color:#374151;border-top:1px solid #e5e7eb">E-Mail</td>
              <td style="padding:10px 12px;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;color:#111827">
                <a href="mailto:${user.email}" style="color:#1d4ed8">${user.email}</a>
              </td>
            </tr>
            ${user.company_name ? `
            <tr style="background:#f9fafb">
              <td style="padding:10px 12px;font-weight:600;color:#374151;border-top:1px solid #e5e7eb">Firma</td>
              <td style="padding:10px 12px;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;color:#111827">${user.company_name}</td>
            </tr>` : ''}
            <tr style="background:${user.company_name ? '#fff' : '#f9fafb'}">
              <td style="padding:10px 12px;font-weight:600;color:#374151;border-top:1px solid #e5e7eb">Dokument-Typ</td>
              <td style="padding:10px 12px;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;color:#111827;font-weight:600">${label}</td>
            </tr>
            <tr style="background:#f9fafb">
              <td style="padding:10px 12px;font-weight:600;color:#374151;border-top:1px solid #e5e7eb">Hochgeladen am</td>
              <td style="padding:10px 12px;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;color:#111827">${now}</td>
            </tr>
          </table>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin#docs"
            style="display:inline-block;background:#1d4ed8;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">
            → Jetzt im Admin-Panel freigeben
          </a>
          <p style="color:#9ca3af;font-size:13px;margin-top:24px">
            PDR Connect · Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus<br>
            <a href="mailto:info@cybratech-solutions.com" style="color:#9ca3af">info@cybratech-solutions.com</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendProfileUpdateRequestEmail(to: string, name: string, lang?: string) {
  const l = normLang(lang);
  const c = ({
    en: {
      subject: '📋 Please update your PDR Connect profile',
      greeting: `Hello ${name},`,
      body1: 'To ensure the quality and credibility of our platform, we have updated the requirements for user profiles.',
      body2: 'Please make sure your profile contains the following required fields before submitting a verification request:',
      items: [
        'Full name (contact person)',
        'Company name',
        'Company address (street, house number, ZIP, country)',
        'Business phone number',
        'At least one available country',
        'Professional role (at least one)',
        'Accept Terms & Conditions and Privacy Policy',
      ],
      body3: 'Please log in and update your profile so that your verification request can be processed.',
      btn: 'Update profile now →',
      body4: 'Once your profile is complete, you can submit a verification request under <strong>Documents</strong>.',
      op: 'Operated by Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus',
    },
    de: {
      subject: '📋 Bitte aktualisieren Sie Ihr PDR Connect Profil',
      greeting: `Hallo ${name},`,
      body1: 'Um die Qualität und Seriosität unserer Plattform sicherzustellen, haben wir die Anforderungen für Nutzerprofile aktualisiert.',
      body2: 'Bitte stellen Sie sicher, dass Ihr Profil folgende Pflichtfelder enthält, bevor Sie eine Verifizierungsanfrage stellen:',
      items: [
        'Vollständiger Name (Ansprechpartner)',
        'Firmenname',
        'Firmenadresse (Straße, Hausnummer, PLZ, Land)',
        'Telefonnummer des Unternehmers',
        'Mindestens ein verfügbares Land',
        'Berufsrolle (mindestens eine)',
        'AGB und Datenschutz akzeptieren',
      ],
      body3: 'Bitte melden Sie sich an und aktualisieren Sie Ihr Profil, damit Ihr Antrag auf Verifizierung verarbeitet werden kann.',
      btn: 'Profil jetzt aktualisieren →',
      body4: 'Sobald Ihr Profil vollständig ausgefüllt ist, können Sie unter <strong>Dokumente</strong> eine Verifizierungsanfrage stellen.',
      op: 'Betrieben von Cybratech-Solutions · Efesou 9, 5280 Paralimni, Zypern',
    },
    es: {
      subject: '📋 Por favor actualiza tu perfil de PDR Connect',
      greeting: `Hola ${name},`,
      body1: 'Para garantizar la calidad y credibilidad de nuestra plataforma, hemos actualizado los requisitos para los perfiles de usuario.',
      body2: 'Por favor asegúrate de que tu perfil contenga los siguientes campos obligatorios antes de enviar una solicitud de verificación:',
      items: [
        'Nombre completo (persona de contacto)',
        'Nombre de la empresa',
        'Dirección de la empresa (calle, número, código postal, país)',
        'Número de teléfono de la empresa',
        'Al menos un país disponible',
        'Rol profesional (al menos uno)',
        'Aceptar Términos y Condiciones y Política de Privacidad',
      ],
      body3: 'Por favor inicia sesión y actualiza tu perfil para que tu solicitud de verificación pueda ser procesada.',
      btn: 'Actualizar perfil ahora →',
      body4: 'Una vez que tu perfil esté completo, puedes enviar una solicitud de verificación en <strong>Documentos</strong>.',
      op: 'Operado por Cybratech-Solutions · Efesou 9, 5280 Paralimni, Chipre',
    },
    el: {
      subject: '📋 Παρακαλώ ενημερώστε το προφίλ σας στο PDR Connect',
      greeting: `Γεια σας ${name},`,
      body1: 'Για να διασφαλίσουμε την ποιότητα και αξιοπιστία της πλατφόρμας μας, έχουμε ενημερώσει τις απαιτήσεις για τα προφίλ χρηστών.',
      body2: 'Βεβαιωθείτε ότι το προφίλ σας περιέχει τα ακόλουθα υποχρεωτικά πεδία πριν υποβάλετε αίτημα επαλήθευσης:',
      items: [
        'Πλήρες όνομα (υπεύθυνος επικοινωνίας)',
        'Όνομα εταιρείας',
        'Διεύθυνση εταιρείας (οδός, αριθμός, ΤΚ, χώρα)',
        'Τηλέφωνο επιχείρησης',
        'Τουλάχιστον μία διαθέσιμη χώρα',
        'Επαγγελματικός ρόλος (τουλάχιστον ένας)',
        'Αποδοχή Όρων Χρήσης και Πολιτικής Απορρήτου',
      ],
      body3: 'Παρακαλώ συνδεθείτε και ενημερώστε το προφίλ σας ώστε το αίτημα επαλήθευσής σας να μπορεί να επεξεργαστεί.',
      btn: 'Ενημέρωση προφίλ τώρα →',
      body4: 'Μόλις το προφίλ σας είναι πλήρες, μπορείτε να υποβάλετε αίτημα επαλήθευσης στην ενότητα <strong>Έγγραφα</strong>.',
      op: 'Λειτουργεί από την Cybratech-Solutions · Efesou 9, 5280 Paralimni, Κύπρος',
    },
  } as Record<Lang, { subject:string; greeting:string; body1:string; body2:string; items:string[]; body3:string; btn:string; body4:string; op:string }>)[l];

  return resend.emails.send({
    from: `${OPERATOR} <${FROM}>`,
    to,
    subject: c.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1d4ed8;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0">PDR Connect</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin-top:0">${c.greeting}</h2>
          <p style="color:#374151">${c.body1}</p>
          <p style="color:#374151">${c.body2}</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
            <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8">
              ${c.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
          <p style="color:#374151">${c.body3}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" style="display:inline-block;background:#1d4ed8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
            ${c.btn}
          </a>
          <p style="color:#374151;margin-top:16px">${c.body4}</p>
          <p style="color:#9ca3af;font-size:13px;margin-top:24px">${c.op}<br>
          <a href="mailto:info@cybratech-solutions.com" style="color:#9ca3af">info@cybratech-solutions.com</a></p>
        </div>
      </div>
    `,
  });
}

export async function sendProfileReminderEmail(to: string, name: string, lang?: string) {
  const l = normLang(lang);
  const c = ({
    en: {
      subject: '⚠️ Action required: Complete your PDR Connect profile',
      header:  'Profile incomplete — action required',
      greeting: `Hello ${name},`,
      intro: 'Your PDR Connect profile is still missing important mandatory information. Without this data, your profile cannot be fully verified and will not be visible to potential clients.',
      missingTitle: 'What is missing:',
      items: [
        {
          icon: '🌍',
          title: 'Available countries',
          desc: 'Please add at least one country where you are available for work. This is required so clients can find you.',
        },
        {
          icon: '📄',
          title: 'Documents & certificates',
          desc: 'Upload your required compliance documents (e.g. EU ID / passport, A1 certificate, company registration) so that your profile can be verified.',
        },
      ],
      action: 'Please log in now and complete your profile and documents.',
      btn1: '→ Update profile (countries)',
      btn2: '→ Upload documents',
      closing: 'If you have any questions, do not hesitate to contact us at any time.',
      op: 'Operated by Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus',
    },
    de: {
      subject: '⚠️ Handlungsbedarf: Vervollständigen Sie Ihr PDR Connect Profil',
      header:  'Profil unvollständig — Handlung erforderlich',
      greeting: `Hallo ${name},`,
      intro: 'Ihrem PDR Connect Profil fehlen noch wichtige Pflichtangaben. Ohne diese Angaben kann Ihr Profil nicht vollständig verifiziert werden und ist für potenzielle Auftraggeber nicht sichtbar.',
      missingTitle: 'Was fehlt:',
      items: [
        {
          icon: '🌍',
          title: 'Verfügbare Länder',
          desc: 'Bitte geben Sie mindestens ein Land an, in dem Sie für Aufträge verfügbar sind. Dies ist erforderlich, damit Kunden Sie finden können.',
        },
        {
          icon: '📄',
          title: 'Unterlagen & Dokumente',
          desc: 'Laden Sie Ihre Pflichtdokumente hoch (z. B. EU-Ausweis / Reisepass, A1-Bescheinigung, Gewerbenachweis), damit Ihr Profil verifiziert werden kann.',
        },
      ],
      action: 'Bitte melden Sie sich jetzt an und ergänzen Sie Ihr Profil sowie Ihre Dokumente.',
      btn1: '→ Profil aktualisieren (Länder)',
      btn2: '→ Dokumente hochladen',
      closing: 'Bei Fragen stehen wir Ihnen jederzeit gerne zur Verfügung.',
      op: 'Betrieben von Cybratech-Solutions · Efesou 9, 5280 Paralimni, Zypern',
    },
    es: {
      subject: '⚠️ Acción requerida: Completa tu perfil de PDR Connect',
      header:  'Perfil incompleto — acción requerida',
      greeting: `Hola ${name},`,
      intro: 'A tu perfil de PDR Connect le falta información obligatoria importante. Sin estos datos, tu perfil no puede ser verificado completamente y no será visible para los clientes potenciales.',
      missingTitle: 'Qué falta:',
      items: [
        {
          icon: '🌍',
          title: 'Países disponibles',
          desc: 'Por favor añade al menos un país donde estés disponible para trabajar. Esto es necesario para que los clientes puedan encontrarte.',
        },
        {
          icon: '📄',
          title: 'Documentos y certificados',
          desc: 'Sube los documentos obligatorios (p. ej. DNI de la UE / pasaporte, certificado A1, registro de empresa) para que tu perfil pueda ser verificado.',
        },
      ],
      action: 'Por favor inicia sesión ahora y completa tu perfil y tus documentos.',
      btn1: '→ Actualizar perfil (países)',
      btn2: '→ Subir documentos',
      closing: 'Si tienes alguna pregunta, no dudes en contactarnos en cualquier momento.',
      op: 'Operado por Cybratech-Solutions · Efesou 9, 5280 Paralimni, Chipre',
    },
    el: {
      subject: '⚠️ Απαιτείται ενέργεια: Συμπληρώστε το προφίλ σας στο PDR Connect',
      header:  'Ελλιπές προφίλ — απαιτείται ενέργεια',
      greeting: `Γεια σας ${name},`,
      intro: 'Στο προφίλ σας στο PDR Connect λείπουν σημαντικές υποχρεωτικές πληροφορίες. Χωρίς αυτά τα δεδομένα, το προφίλ σας δεν μπορεί να επαληθευτεί πλήρως και δεν θα είναι ορατό σε πιθανούς πελάτες.',
      missingTitle: 'Τι λείπει:',
      items: [
        {
          icon: '🌍',
          title: 'Διαθέσιμες χώρες',
          desc: 'Παρακαλώ προσθέστε τουλάχιστον μία χώρα όπου είστε διαθέσιμοι για εργασία. Αυτό είναι απαραίτητο για να μπορούν οι πελάτες να σας βρουν.',
        },
        {
          icon: '📄',
          title: 'Έγγραφα & πιστοποιητικά',
          desc: 'Ανεβάστε τα υποχρεωτικά έγγραφά σας (π.χ. ταυτότητα ΕΕ / διαβατήριο, πιστοποιητικό Α1, εγγραφή επιχείρησης) για να επαληθευτεί το προφίλ σας.',
        },
      ],
      action: 'Παρακαλώ συνδεθείτε τώρα και συμπληρώστε το προφίλ και τα έγγραφά σας.',
      btn1: '→ Ενημέρωση προφίλ (χώρες)',
      btn2: '→ Ανέβασμα εγγράφων',
      closing: 'Εάν έχετε οποιεσδήποτε ερωτήσεις, μη διστάσετε να επικοινωνήσετε μαζί μας ανά πάσα στιγμή.',
      op: 'Λειτουργεί από την Cybratech-Solutions · Efesou 9, 5280 Paralimni, Κύπρος',
    },
  } as Record<Lang, {
    subject: string; header: string; greeting: string; intro: string;
    missingTitle: string;
    items: { icon: string; title: string; desc: string }[];
    action: string; btn1: string; btn2: string; closing: string; op: string;
  }>)[l];

  const itemsHtml = c.items.map(item => `
    <div style="display:flex;gap:14px;align-items:flex-start;padding:14px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:10px">
      <div style="font-size:24px;line-height:1;flex-shrink:0">${item.icon}</div>
      <div>
        <p style="margin:0 0 4px;font-weight:700;color:#111827;font-size:14px">${item.title}</p>
        <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.5">${item.desc}</p>
      </div>
    </div>
  `).join('');

  return resend.emails.send({
    from: `${OPERATOR} <${FROM}>`,
    to,
    subject: c.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#d97706;padding:24px;border-radius:12px 12px 0 0">
          <p style="color:#fef3c7;margin:0 0 4px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">PDR Connect</p>
          <h1 style="color:white;margin:0;font-size:20px">${c.header}</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin-top:0;color:#111827">${c.greeting}</h2>
          <p style="color:#374151;line-height:1.6">${c.intro}</p>

          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:24px 0 8px">
            <p style="margin:0 0 12px;font-weight:700;color:#92400e;font-size:14px">${c.missingTitle}</p>
            ${itemsHtml}
          </div>

          <p style="color:#374151;margin:20px 0 16px;line-height:1.6">${c.action}</p>

          <div style="display:flex;gap:12px;flex-wrap:wrap;margin:8px 0 24px">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile"
               style="display:inline-block;background:#1d4ed8;color:white;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
              ${c.btn1}
            </a>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/documents"
               style="display:inline-block;background:#16a34a;color:white;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
              ${c.btn2}
            </a>
          </div>

          <p style="color:#6b7280;font-size:13px">${c.closing}</p>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #f3f4f6;padding-top:16px">
            ${c.op}<br>
            <a href="mailto:info@cybratech-solutions.com" style="color:#9ca3af">info@cybratech-solutions.com</a>
          </p>
        </div>
      </div>
    `,
  });
}

/**
 * Invitation to apply for the Australia Subclass 400 (Short Stay Specialist)
 * Work Visa. Points the technician to the in-app Documents page where the two
 * invitation-letter templates can be downloaded any time, and asks them to
 * reply with the applicant details needed to issue their letter.
 */
export async function sendWorkVisaInvitationEmail(to: string, name: string, lang?: string) {
  const l = normLang(lang);
  const c = ({
    en: {
      subject: '🇦🇺 Work Visa for Australia — download your invitation documents',
      header: 'Work Visa for Australia 🇦🇺',
      greeting: `Hello ${name},`,
      intro: 'PDR-Team / Absolute Dent Repair is supporting Subclass 400 (Temporary Work – Short Stay Specialist) visas so certified PDR technicians can travel to Australia for the upcoming hail-repair season. Typical engagement: 3–4 months of project-based work, with earnings of approximately AUD $2,000–$4,000 per week depending on repairs completed.',
      stepsTitle: 'How it works',
      steps: [
        'Open the <strong>Documents</strong> page in PDR Connect and download the two invitation-letter templates (available any time).',
        'Reply to this email with your applicant details: full name (exactly as in your passport), passport number, date of birth, nationality, and a clear photo of your passport page.',
        'We issue and sign your official Letter of Invitation for the Subclass 400 visa application.',
        'Once your visa is approved, upload it to your profile under <strong>Documents → Work Visa</strong>.',
      ],
      btn: 'Open Documents in PDR Connect →',
      directTitle: 'Direct download:',
      adrLabel: 'ADR — Subclass 400 Invitation Template',
      pdrLabel: 'PDR-Team — Subclass 400 Invitation Template',
      closing: 'Please act as soon as possible so we can secure your place for the Australian season.',
      op: 'Operated by Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus',
    },
    de: {
      subject: '🇦🇺 Arbeitsvisum für Australien — Einladungsdokumente herunterladen',
      header: 'Arbeitsvisum für Australien 🇦🇺',
      greeting: `Hallo ${name},`,
      intro: 'PDR-Team / Absolute Dent Repair unterstützt Visa der Subklasse 400 (Temporary Work – Short Stay Specialist), damit zertifizierte PDR-Techniker für die kommende Hagelsaison nach Australien reisen können. Typischer Einsatz: 3–4 Monate projektbasierte Arbeit, mit einem Verdienst von ca. AUD 2.000–4.000 pro Woche, je nach abgeschlossenen Reparaturen.',
      stepsTitle: 'So funktioniert es',
      steps: [
        'Öffnen Sie die Seite <strong>Dokumente</strong> in PDR Connect und laden Sie die beiden Einladungsschreiben-Vorlagen herunter (jederzeit verfügbar).',
        'Antworten Sie auf diese E-Mail mit Ihren Antragsdaten: vollständiger Name (genau wie im Reisepass), Reisepassnummer, Geburtsdatum, Staatsangehörigkeit und ein deutliches Foto Ihrer Passseite.',
        'Wir stellen Ihr offizielles Einladungsschreiben für den Subclass-400-Visumantrag aus und unterzeichnen es.',
        'Sobald Ihr Visum genehmigt ist, laden Sie es in Ihrem Profil unter <strong>Dokumente → Work Visa</strong> hoch.',
      ],
      btn: 'Dokumente in PDR Connect öffnen →',
      directTitle: 'Direkter Download:',
      adrLabel: 'ADR — Subclass 400 Einladungsvorlage',
      pdrLabel: 'PDR-Team — Subclass 400 Einladungsvorlage',
      closing: 'Bitte handeln Sie so schnell wie möglich, damit wir Ihren Platz für die australische Saison sichern können.',
      op: 'Betrieben von Cybratech-Solutions · Efesou 9, 5280 Paralimni, Zypern',
    },
    es: {
      subject: '🇦🇺 Visa de trabajo para Australia — descarga tus documentos de invitación',
      header: 'Visa de trabajo para Australia 🇦🇺',
      greeting: `Hola ${name},`,
      intro: 'PDR-Team / Absolute Dent Repair apoya las visas Subclass 400 (Trabajo Temporal – Especialista de Estancia Corta) para que técnicos de PDR certificados puedan viajar a Australia para la próxima temporada de granizo. Compromiso típico: 3–4 meses de trabajo por proyecto, con ingresos de aproximadamente AUD 2.000–4.000 por semana según las reparaciones completadas.',
      stepsTitle: 'Cómo funciona',
      steps: [
        'Abre la página <strong>Documentos</strong> en PDR Connect y descarga las dos plantillas de carta de invitación (disponibles en cualquier momento).',
        'Responde a este correo con tus datos: nombre completo (exactamente como en el pasaporte), número de pasaporte, fecha de nacimiento, nacionalidad y una foto clara de la página de tu pasaporte.',
        'Emitimos y firmamos tu Carta de Invitación oficial para la solicitud de la visa Subclass 400.',
        'Una vez aprobada tu visa, súbela a tu perfil en <strong>Documentos → Work Visa</strong>.',
      ],
      btn: 'Abrir Documentos en PDR Connect →',
      directTitle: 'Descarga directa:',
      adrLabel: 'ADR — Plantilla de invitación Subclass 400',
      pdrLabel: 'PDR-Team — Plantilla de invitación Subclass 400',
      closing: 'Por favor actúa lo antes posible para que podamos asegurar tu lugar para la temporada australiana.',
      op: 'Operado por Cybratech-Solutions · Efesou 9, 5280 Paralimni, Chipre',
    },
    el: {
      subject: '🇦🇺 Άδεια εργασίας για Αυστραλία — κατεβάστε τα έγγραφα πρόσκλησης',
      header: 'Άδεια εργασίας για Αυστραλία 🇦🇺',
      greeting: `Γεια σας ${name},`,
      intro: 'Η PDR-Team / Absolute Dent Repair υποστηρίζει βίζες Subclass 400 (Προσωρινή Εργασία – Ειδικός Σύντομης Διαμονής) ώστε πιστοποιημένοι τεχνικοί PDR να ταξιδέψουν στην Αυστραλία για την επερχόμενη σεζόν χαλαζιού. Τυπική απασχόληση: 3–4 μήνες εργασίας ανά έργο, με αποδοχές περίπου AUD 2.000–4.000 την εβδομάδα ανάλογα με τις επισκευές.',
      stepsTitle: 'Πώς λειτουργεί',
      steps: [
        'Ανοίξτε τη σελίδα <strong>Έγγραφα</strong> στο PDR Connect και κατεβάστε τα δύο πρότυπα επιστολής πρόσκλησης (διαθέσιμα ανά πάσα στιγμή).',
        'Απαντήστε σε αυτό το email με τα στοιχεία σας: πλήρες όνομα (όπως ακριβώς στο διαβατήριο), αριθμό διαβατηρίου, ημερομηνία γέννησης, υπηκοότητα και μια καθαρή φωτογραφία της σελίδας του διαβατηρίου σας.',
        'Εκδίδουμε και υπογράφουμε την επίσημη Επιστολή Πρόσκλησής σας για την αίτηση βίζας Subclass 400.',
        'Μόλις εγκριθεί η βίζα σας, ανεβάστε την στο προφίλ σας στα <strong>Έγγραφα → Work Visa</strong>.',
      ],
      btn: 'Άνοιγμα Εγγράφων στο PDR Connect →',
      directTitle: 'Άμεση λήψη:',
      adrLabel: 'ADR — Πρότυπο πρόσκλησης Subclass 400',
      pdrLabel: 'PDR-Team — Πρότυπο πρόσκλησης Subclass 400',
      closing: 'Παρακαλώ ενεργήστε το συντομότερο δυνατό ώστε να εξασφαλίσουμε τη θέση σας για την αυστραλιανή σεζόν.',
      op: 'Λειτουργεί από την Cybratech-Solutions · Efesou 9, 5280 Paralimni, Κύπρος',
    },
  } as Record<Lang, {
    subject: string; header: string; greeting: string; intro: string;
    stepsTitle: string; steps: string[]; btn: string; directTitle: string;
    adrLabel: string; pdrLabel: string; closing: string; op: string;
  }>)[l];

  const stepsHtml = c.steps.map((s, i) => `
    <div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0">
      <div style="flex-shrink:0;width:26px;height:26px;border-radius:50%;background:#1d4ed8;color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;line-height:1">${i + 1}</div>
      <div style="color:#374151;font-size:14px;line-height:1.5">${s}</div>
    </div>`).join('');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pdrconnect.eu';

  return resend.emails.send({
    from: `${OPERATOR} <${FROM}>`,
    to,
    subject: c.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1d4ed8;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:21px">${c.header}</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin-top:0;color:#111827">${c.greeting}</h2>
          <p style="color:#374151;line-height:1.6">${c.intro}</p>

          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:8px 18px;margin:20px 0">
            <p style="margin:8px 0 4px;font-weight:700;color:#111827;font-size:14px">${c.stepsTitle}</p>
            ${stepsHtml}
          </div>

          <a href="${appUrl}/documents" style="display:inline-block;background:#1d4ed8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:8px 0 20px">
            ${c.btn}
          </a>

          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 16px;margin:8px 0 20px">
            <p style="margin:0 0 8px;color:#1e40af;font-size:13px;font-weight:600">${c.directTitle}</p>
            <p style="margin:4px 0"><a href="${VISA_TEMPLATE_URLS.adr}" style="color:#1d4ed8;font-size:14px">📄 ${c.adrLabel}</a></p>
            <p style="margin:4px 0"><a href="${VISA_TEMPLATE_URLS.pdrTeam}" style="color:#1d4ed8;font-size:14px">📄 ${c.pdrLabel}</a></p>
          </div>

          <p style="color:#374151;line-height:1.6">${c.closing}</p>
          <p style="color:#9ca3af;font-size:13px;margin-top:24px;border-top:1px solid #f3f4f6;padding-top:16px">${c.op}<br>
          <a href="mailto:info@cybratech-solutions.com" style="color:#9ca3af">info@cybratech-solutions.com</a></p>
        </div>
      </div>
    `,
  });
}

export async function sendEmailConfirmationEmail(
  to: string,
  name: string,
  confirmationUrl: string,
  lang?: string,
) {
  const l = normLang(lang);

  // Personal subjects — avoid "noreply", "activate", "confirm" spam triggers
  const subjects: Record<Lang, string> = {
    en: `Welcome to PDR Connect, ${name}`,
    de: `Willkommen bei PDR Connect, ${name}`,
    es: `Bienvenido a PDR Connect, ${name}`,
    el: `Καλώς ήλθατε στο PDR Connect, ${name}`,
  };

  const greetings: Record<Lang, string> = {
    en: `Hello ${name},\n\nThank you for joining PDR Connect.\n\nTo activate your account, please open the link below:\n\n${confirmationUrl}\n\nThis link expires in 24 hours.\n\nBest regards,\nPDR Connect\ninfo@cybratech-solutions.com`,
    de: `Hallo ${name},\n\nVielen Dank für Ihre Registrierung bei PDR Connect.\n\nUm Ihr Konto zu aktivieren, öffnen Sie bitte den folgenden Link:\n\n${confirmationUrl}\n\nDieser Link ist 24 Stunden gültig.\n\nMit freundlichen Grüßen,\nPDR Connect\ninfo@cybratech-solutions.com`,
    es: `Hola ${name},\n\nGracias por registrarte en PDR Connect.\n\nPara activar tu cuenta, abre el siguiente enlace:\n\n${confirmationUrl}\n\nEste enlace expira en 24 horas.\n\nSaludos,\nPDR Connect\ninfo@cybratech-solutions.com`,
    el: `Γεια σας ${name},\n\nΕυχαριστούμε για την εγγραφή σας στο PDR Connect.\n\nΓια να ενεργοποιήσετε τον λογαριασμό σας, ανοίξτε τον παρακάτω σύνδεσμο:\n\n${confirmationUrl}\n\nΑυτός ο σύνδεσμος λήγει σε 24 ώρες.\n\nΜε εκτίμηση,\nPDR Connect\ninfo@cybratech-solutions.com`,
  };

  const plainText = greetings[l];

  // Minimal HTML — no styled buttons, no complex layout, just clean text
  const htmlBody = plainText.replace(/\n/g, '<br>').replace(
    confirmationUrl,
    `<a href="${confirmationUrl}">${confirmationUrl}</a>`,
  );

  return resend.emails.send({
    from: `PDR Connect by Cybratech-Solutions <${FROM}>`,
    to,
    subject: subjects[l],
    text: plainText,          // plain-text version (lower spam score)
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#222;line-height:1.7;max-width:580px">${htmlBody}</div>`,
  });
}

/**
 * Daily automated reminder — shows the user exactly which of the 5 mandatory
 * profile steps are still missing and links directly to the profile page.
 */
export async function sendProfileCompletionReminderEmail(
  to: string,
  name: string,
  lang?: string,
  missingKeys: string[] = [],
  doneCount = 0,
) {
  const l = normLang(lang);

  // Step labels in each language
  const STEP_LABELS: Record<string, Record<Lang, string>> = {
    company_info:  { en: 'Company information',       de: 'Firmendaten',           es: 'Datos de empresa',          el: 'Στοιχεία εταιρείας'    },
    company_doc:   { en: 'Company document',          de: 'Firmenunterlage',        es: 'Documento de empresa',      el: 'Έγγραφο εταιρείας'     },
    services:      { en: 'Services / Skills (min. 1)',de: 'Dienstleistungen (min. 1)',es:'Servicios (mín. 1)',        el: 'Υπηρεσίες (τουλ. 1)'   },
    countries:     { en: 'Available countries (min. 1)',de:'Verfügbare Länder (min. 1)',es:'Países disponibles (mín. 1)',el:'Διαθέσιμες χώρες (τουλ. 1)'},
    identity_doc:  { en: 'Passport or EU ID',         de: 'Reisepass oder EU-Ausweis',es:'Pasaporte o DNI de la UE',  el: 'Διαβατήριο ή ταυτότητα ΕΕ'},
  };

  const ALL_KEYS = ['company_info', 'company_doc', 'services', 'countries', 'identity_doc'];

  const stepsHtml = ALL_KEYS.map(key => {
    const missing = missingKeys.includes(key);
    const label = STEP_LABELS[key]?.[l] ?? STEP_LABELS[key]?.['en'] ?? key;
    const icon = missing ? '❌' : '✅';
    const color = missing ? '#dc2626' : '#16a34a';
    const bg    = missing ? '#fef2f2' : '#f0fdf4';
    const border= missing ? '#fecaca' : '#bbf7d0';
    return `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:${bg};border:1px solid ${border};border-radius:8px;margin-bottom:8px">
        <span style="font-size:18px;flex-shrink:0">${icon}</span>
        <span style="font-size:14px;font-weight:${missing ? '700' : '400'};color:${color}">${label}</span>
      </div>`;
  }).join('');

  const c = ({
    en: {
      subject: `⚠️ Profile incomplete (${doneCount}/5) — PDR Connect`,
      header:  `Profile incomplete — ${doneCount} of 5 steps done`,
      greeting: `Hello ${name},`,
      intro: 'Your PDR Connect profile is missing mandatory information. Until all 5 steps are complete, your profile is <strong>not visible</strong> in the technician search.',
      stepsTitle: 'Status of your profile:',
      action: 'Please log in and complete the missing steps — it only takes a few minutes.',
      btn: 'Complete my profile →',
      footer: 'You will receive this reminder daily until your profile is fully complete.',
      op: 'Operated by Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus',
    },
    de: {
      subject: `⚠️ Profil unvollständig (${doneCount}/5) — PDR Connect`,
      header:  `Profil unvollständig — ${doneCount} von 5 Schritten erledigt`,
      greeting: `Hallo ${name},`,
      intro: 'Ihrem PDR Connect Profil fehlen Pflichtangaben. Solange nicht alle 5 Schritte vollständig sind, ist Ihr Profil in der Technikervermittlung <strong>nicht sichtbar</strong>.',
      stepsTitle: 'Status Ihres Profils:',
      action: 'Bitte melden Sie sich an und vervollständigen Sie die fehlenden Schritte — es dauert nur wenige Minuten.',
      btn: 'Profil jetzt vervollständigen →',
      footer: 'Sie erhalten diese Erinnerung täglich, bis Ihr Profil vollständig ausgefüllt ist.',
      op: 'Betrieben von Cybratech-Solutions · Efesou 9, 5280 Paralimni, Zypern',
    },
    es: {
      subject: `⚠️ Perfil incompleto (${doneCount}/5) — PDR Connect`,
      header:  `Perfil incompleto — ${doneCount} de 5 pasos completados`,
      greeting: `Hola ${name},`,
      intro: 'A tu perfil de PDR Connect le faltan datos obligatorios. Hasta que los 5 pasos estén completos, tu perfil <strong>no será visible</strong> en la búsqueda de técnicos.',
      stepsTitle: 'Estado de tu perfil:',
      action: 'Por favor inicia sesión y completa los pasos que faltan — solo lleva unos minutos.',
      btn: 'Completar mi perfil →',
      footer: 'Recibirás este recordatorio diariamente hasta que tu perfil esté completamente completo.',
      op: 'Operado por Cybratech-Solutions · Efesou 9, 5280 Paralimni, Chipre',
    },
    el: {
      subject: `⚠️ Ελλιπές προφίλ (${doneCount}/5) — PDR Connect`,
      header:  `Ελλιπές προφίλ — ${doneCount} από 5 βήματα ολοκληρώθηκαν`,
      greeting: `Γεια σας ${name},`,
      intro: 'Στο προφίλ σας στο PDR Connect λείπουν υποχρεωτικές πληροφορίες. Μέχρι να ολοκληρωθούν και τα 5 βήματα, το προφίλ σας <strong>δεν είναι ορατό</strong> στην αναζήτηση τεχνικών.',
      stepsTitle: 'Κατάσταση του προφίλ σας:',
      action: 'Παρακαλώ συνδεθείτε και συμπληρώστε τα βήματα που λείπουν — χρειάζεται μόνο λίγα λεπτά.',
      btn: 'Συμπλήρωση προφίλ →',
      footer: 'Θα λαμβάνετε αυτή την υπενθύμιση καθημερινά μέχρι να ολοκληρωθεί το προφίλ σας.',
      op: 'Λειτουργεί από την Cybratech-Solutions · Efesou 9, 5280 Paralimni, Κύπρος',
    },
  } as Record<Lang, { subject:string; header:string; greeting:string; intro:string; stepsTitle:string; action:string; btn:string; footer:string; op:string }>)[l];

  return resend.emails.send({
    from: `${OPERATOR} <${FROM}>`,
    to,
    subject: c.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#d97706;padding:24px;border-radius:12px 12px 0 0">
          <p style="color:#fef3c7;margin:0 0 4px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em">PDR Connect</p>
          <h1 style="color:white;margin:0;font-size:18px">${c.header}</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin-top:0;color:#111827">${c.greeting}</h2>
          <p style="color:#374151;line-height:1.6">${c.intro}</p>

          <p style="font-weight:700;color:#111827;margin:24px 0 10px">${c.stepsTitle}</p>
          ${stepsHtml}

          <p style="color:#374151;margin:20px 0 16px;line-height:1.6">${c.action}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile"
             style="display:inline-block;background:#1d4ed8;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;margin-bottom:24px">
            ${c.btn}
          </a>
          <p style="color:#9ca3af;font-size:12px;margin-top:8px;padding-top:16px;border-top:1px solid #f3f4f6">
            ${c.footer}<br><br>
            ${c.op}<br>
            <a href="mailto:info@cybratech-solutions.com" style="color:#9ca3af">info@cybratech-solutions.com</a>
          </p>
        </div>
      </div>
    `,
  });
}

/**
 * Reminder to users who haven't filled in their company information yet.
 * Sent manually by admin from the admin panel.
 */
export async function sendCompanyInfoReminderEmail(to: string, name: string, lang?: string) {
  const l = normLang(lang);
  const c = ({
    en: {
      subject: '⚠️ PDR Connect — Please complete your company information',
      header:  'Company information missing',
      greeting: `Hello ${name},`,
      body1: 'We noticed that your PDR Connect account is missing important company information.',
      body2: 'Without complete company details, you will not have full access to the platform and your profile will not be visible to other professionals.',
      missing: 'The following information is missing:',
      items: ['Company name', 'Full company address (street, house number, ZIP, country)', 'Business phone number'],
      action: 'Please log in now and fill in your company details — it only takes 2 minutes.',
      btn: '→ Complete company information now',
      closing: 'If you have any questions, feel free to contact us at any time.',
      op: 'Operated by Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus',
    },
    de: {
      subject: '⚠️ PDR Connect — Bitte Firmeninformationen vervollständigen',
      header:  'Firmeninformationen fehlen',
      greeting: `Hallo ${name},`,
      body1: 'Wir haben festgestellt, dass in Ihrem PDR Connect Konto noch wichtige Firmeninformationen fehlen.',
      body2: 'Ohne vollständige Firmendaten haben Sie keinen vollständigen Zugang zur Plattform und Ihr Profil ist für andere Fachleute nicht sichtbar.',
      missing: 'Folgende Angaben fehlen noch:',
      items: ['Firmenname', 'Vollständige Firmenadresse (Straße, Hausnummer, PLZ, Land)', 'Telefonnummer des Unternehmers'],
      action: 'Bitte melden Sie sich jetzt an und tragen Sie Ihre Firmendaten ein — es dauert nur 2 Minuten.',
      btn: '→ Firmendaten jetzt vervollständigen',
      closing: 'Bei Fragen stehen wir Ihnen jederzeit gerne zur Verfügung.',
      op: 'Betrieben von Cybratech-Solutions · Efesou 9, 5280 Paralimni, Zypern',
    },
    es: {
      subject: '⚠️ PDR Connect — Por favor completa los datos de tu empresa',
      header:  'Datos de empresa incompletos',
      greeting: `Hola ${name},`,
      body1: 'Hemos notado que en tu cuenta de PDR Connect faltan datos importantes de la empresa.',
      body2: 'Sin datos completos de la empresa, no tendrás acceso completo a la plataforma y tu perfil no será visible para otros profesionales.',
      missing: 'Falta la siguiente información:',
      items: ['Nombre de la empresa', 'Dirección completa (calle, número, código postal, país)', 'Número de teléfono de la empresa'],
      action: 'Por favor inicia sesión ahora y completa los datos de tu empresa — solo lleva 2 minutos.',
      btn: '→ Completar datos de empresa ahora',
      closing: 'Si tienes alguna pregunta, no dudes en contactarnos.',
      op: 'Operado por Cybratech-Solutions · Efesou 9, 5280 Paralimni, Chipre',
    },
    el: {
      subject: '⚠️ PDR Connect — Παρακαλώ συμπληρώστε τα στοιχεία της εταιρείας σας',
      header:  'Λείπουν στοιχεία εταιρείας',
      greeting: `Γεια σας ${name},`,
      body1: 'Παρατηρήσαμε ότι στον λογαριασμό σας στο PDR Connect λείπουν σημαντικά στοιχεία εταιρείας.',
      body2: 'Χωρίς πλήρη στοιχεία εταιρείας, δεν θα έχετε πλήρη πρόσβαση στην πλατφόρμα και το προφίλ σας δεν θα είναι ορατό σε άλλους επαγγελματίες.',
      missing: 'Λείπουν τα ακόλουθα στοιχεία:',
      items: ['Επωνυμία εταιρείας', 'Πλήρης διεύθυνση εταιρείας (οδός, αριθμός, ΤΚ, χώρα)', 'Τηλέφωνο επιχείρησης'],
      action: 'Παρακαλώ συνδεθείτε τώρα και συμπληρώστε τα στοιχεία της εταιρείας σας — χρειάζεται μόνο 2 λεπτά.',
      btn: '→ Συμπλήρωση στοιχείων εταιρείας τώρα',
      closing: 'Εάν έχετε οποιεσδήποτε ερωτήσεις, μη διστάσετε να επικοινωνήσετε μαζί μας.',
      op: 'Λειτουργεί από την Cybratech-Solutions · Efesou 9, 5280 Paralimni, Κύπρος',
    },
  } as Record<Lang, { subject:string; header:string; greeting:string; body1:string; body2:string; missing:string; items:string[]; action:string; btn:string; closing:string; op:string }>)[l];

  return resend.emails.send({
    from: `${OPERATOR} <${FROM}>`,
    to,
    subject: c.subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#d97706;padding:24px;border-radius:12px 12px 0 0">
          <p style="color:#fef3c7;margin:0 0 4px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em">PDR Connect</p>
          <h1 style="color:white;margin:0;font-size:20px">⚠️ ${c.header}</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="margin-top:0;color:#111827">${c.greeting}</h2>
          <p style="color:#374151;line-height:1.6">${c.body1}</p>
          <p style="color:#374151;line-height:1.6">${c.body2}</p>

          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:20px 0">
            <p style="margin:0 0 10px;font-weight:700;color:#92400e;font-size:14px">${c.missing}</p>
            ${c.items.map(item => `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #fef3c7">
                <span style="color:#d97706;font-size:16px">⚠️</span>
                <span style="color:#374151;font-size:14px;font-weight:600">${item}</span>
              </div>
            `).join('')}
          </div>

          <p style="color:#374151;margin:20px 0 16px;line-height:1.6">${c.action}</p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding"
             style="display:inline-block;background:#1d4ed8;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;margin-bottom:24px">
            ${c.btn}
          </a>

          <p style="color:#6b7280;font-size:13px">${c.closing}</p>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #f3f4f6;padding-top:16px">
            ${c.op}<br>
            <a href="mailto:info@cybratech-solutions.com" style="color:#9ca3af">info@cybratech-solutions.com</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendBypassWarningEmail(to: string, name: string, count: number) {
  return resend.emails.send({
    from: `${OPERATOR} <${FROM}>`,
    to,
    subject: `⚠️ Platform Rule Violation Warning (${count}/5)`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#ea580c;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0">⚠️ Warning</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2>Rule Violation Detected, ${name}</h2>
          <p>We detected an attempt to share contact information outside the platform. This is violation <strong>${count} of 5</strong>.</p>
          <p>Accounts with 5 or more violations are automatically suspended. All communication must remain within PDR Connect.</p>
          <p style="color:#6b7280;font-size:14px">If you believe this is a mistake, please contact us at <a href="mailto:info@cybratech-solutions.com" style="color:#6b7280">info@cybratech-solutions.com</a><br>Operated by Cybratech-Solutions · Efesou 9, 5280 Paralimni, Cyprus</p>
        </div>
      </div>
    `,
  });
}
