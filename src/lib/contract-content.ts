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

  /* ═══════════════════════════════════════════════════════════
     DEUTSCH  (DE)
  ═══════════════════════════════════════════════════════════ */
  de: {
    pageTitle: 'Plattform-Verträge',
    pageSubtitle: 'Zwei Vertragsversionen — für Kunden/Auftraggeber und für Techniker/Fachkräfte',
    tabClient: '🏢 Für Kunden / Auftraggeber',
    tabWorker: '🔧 Für Techniker / Fachkräfte',

    /* ── CLIENT ── */
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
          p: 'PDR Connect erbringt professionelle Personalvermittlungsdienstleistungen und präsentiert dem Kunden verifizierte PDR-Techniker und Kfz-Fachkräfte über die PDR Connect Plattform (pdrconnect.eu). PDR Connect ist dabei ausschließlich als Vermittler tätig und wird nicht selbst Vertragspartner des zwischen Auftraggeber und Techniker geschlossenen Auftragsvertrages.',
        },
        {
          h: '§2 Von PDR Connect erbrachte Leistungen',
          p: 'PDR Connect erbringt folgende Leistungen für den Kunden:',
          list: [
            'Identifizierung und Präsentation verifizierter Techniker gemäß den Anforderungen des Kunden',
            'Verifizierung beruflicher Qualifikationen, Zertifikate und Ausweisdokumente',
            'Erleichterung sicherer Kommunikation zwischen Kunde und Techniker über die Plattform',
            'Ausstellung aller Rechnungen und Abwicklung aller Zahlungen',
            'Laufender Support und Unterstützung während des gesamten Vermittlungsprozesses',
          ],
        },
        {
          h: '§3 Plattformservice — Auftraggeber (Derzeit kostenlos)',
          p: '(1) In der aktuellen Startphase erbringt PDR Connect seine Vermittlungs- und Matching-Leistungen für Auftraggeber kostenlos. Es wird keine Plattformgebühr vom Auftraggeber erhoben.\n(2) Auftraggeber zahlen ausschließlich die vereinbarte Technikervergütung gemäß der von PDR Connect ausgestellten Rechnung. Es fallen keine zusätzlichen Plattformgebühren an.\n(3) Beispiel: Bei einer vereinbarten Technikervergütung von 1.000 € erhält der Auftraggeber eine Rechnung über genau 1.000 €.\n(4) PDR Connect behält sich vor, in Zukunft eine Plattformgebühr für Auftraggeber einzuführen. Auftraggeber werden mit mindestens 30 Tagen Vorankündigung informiert, bevor eine solche Gebühr in Kraft tritt. Der Kunde ist berechtigt, den Vertrag bis zum Zeitpunkt des Inkrafttretens der Änderung fristlos zu kündigen.',
        },
        {
          h: '§4 Zahlungsbedingungen',
          p: '(1) Als Auftraggeber haben Sie freien, kostenlosen Zugang zu unserer Plattform. Sofern eine Zahlungsverpflichtung entsteht, gelten folgende Bedingungen:\n(2) Alle Rechnungen sind binnen 14 Tagen nach Rechnungsdatum zu zahlen an: Cybratech Solutions Ltd. · Efesou 9, 5280 Paralimni, Zypern · USt-IdNr.: CY60015676H.\n(3) Alle Zahlungen sind ausschließlich an PDR Connect (Cybratech Solutions Ltd.) zu überweisen. Direkte Zahlungen an Techniker außerhalb der Plattform sind untersagt.\n(4) Bei Verdacht auf Zahlungsumgehung ist PDR Connect berechtigt, Zahlungen vorübergehend zurückzuhalten, soweit dies zur Prüfung des Sachverhalts erforderlich ist. Nach Abschluss der Prüfung werden unstreitige Beträge unverzüglich ausgezahlt bzw. abgerechnet. Das Recht auf Sperrung des Kontos und Geltendmachung weiterer Ansprüche bleibt vorbehalten.\n(5) Verzugszinsen richten sich nach Art. 10 ff. der EU-Richtlinie 2011/7/EU über Zahlungsverzug bzw. dem anwendbaren nationalen Recht des Auftraggebers.',
        },
        {
          h: '§5 Kundenpflichten',
          list: [
            'Genaue und vollständige Auftragsanforderungen bereitstellen',
            'Sichere, legale und professionell geeignete Arbeitsumgebung für vermittelte Techniker gewährleisten',
            'Alle anwendbaren Arbeits-, Steuer- und Sozialversicherungsgesetze im Einsatzland einhalten',
            'Vereinbarte Auftragsbedingungen einschließlich Dauer, Umfang und Vergütung einhalten',
            'Kommunikation mit Technikern ausschließlich über die PDR Connect Plattform führen',
            'Keine direkten Beschäftigungs- oder Dienstverhältnisse mit vermittelten Technikern außerhalb von PDR Connect eingehen',
          ],
        },
        {
          h: '§6 Technikerverifizierung und Gewährleistung',
          p: '(1) PDR Connect versichert, dass alle präsentierten Techniker durch offizielle Dokumente identitätsverifiziert wurden.\n(2) PDR Connect übernimmt keine Garantie für spezifische Arbeitsergebnisse, Produktivitätsniveaus oder Projekterfolge.\n(3) Der Kunde ist verantwortlich für die Beurteilung der fachlichen Eignung der präsentierten Techniker für seinen konkreten Bedarf.',
        },
        {
          h: '§7 Datenschutz und DSGVO',
          p: '(1) PDR Connect verarbeitet personenbezogene Daten des Kunden ausschließlich zur Erfüllung dieses Vertrages und zur Erbringung der Vermittlungsleistungen.\n(2) Die Verarbeitung personenbezogener Daten erfolgt gemäß der jeweils aktuellen Datenschutzerklärung von PDR Connect sowie der Verordnung (EU) 2016/679 (Datenschutz-Grundverordnung — DSGVO).\n(3) Der Kunde hat das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gemäß Art. 15–22 DSGVO. Anfragen sind an: datenschutz@cybratech-solutions.com zu richten.\n(4) Eine Weitergabe von Kundendaten an Dritte erfolgt nur, soweit dies zur Vertragserfüllung (z.B. Vermittlung des Technikers) erforderlich oder gesetzlich vorgeschrieben ist.',
        },
        {
          h: '§8 Vertraulichkeit',
          p: '(1) Beide Parteien behandeln alle kommerziellen Konditionen, Preise und Auftragsdetails streng vertraulich.\n(2) Diese Vertraulichkeitsverpflichtung gilt über die Vertragslaufzeit hinaus für einen Zeitraum von drei (3) Jahren nach Vertragsende.',
        },
        {
          h: '§9 Haftung',
          p: '(1) PDR Connect haftet unbeschränkt für Schäden, die auf Vorsatz oder grober Fahrlässigkeit von PDR Connect, seiner gesetzlichen Vertreter oder Erfüllungsgehilfen beruhen, sowie bei Verletzung von Leben, Körper oder Gesundheit.\n(2) Bei einfacher Fahrlässigkeit haftet PDR Connect nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), deren Erfüllung die ordnungsgemäße Durchführung des Vertrages überhaupt erst ermöglicht und auf deren Einhaltung der Kunde regelmäßig vertrauen darf. In diesen Fällen ist die Haftung auf den typischerweise vorhersehbaren Schaden begrenzt.\n(3) Eine weitergehende Haftung ist ausgeschlossen. Dies gilt insbesondere für entgangenen Gewinn, mittelbare Schäden und Folgeschäden.\n(4) Die vorstehenden Haftungsbeschränkungen gelten nicht, soweit zwingend anwendbares Verbraucher- oder EU-Recht eine strengere Haftung vorschreibt.',
        },
        {
          h: '§10 Streitigkeiten zwischen Auftraggeber und Techniker',
          p: '(1) Im Falle von Streitigkeiten über die Qualität oder den Umfang erbrachter Leistungen zwischen Auftraggeber und Techniker kann PDR Connect betroffene Zahlungen bis zur abschließenden Klärung des Sachverhalts vorübergehend zurückhalten.\n(2) PDR Connect entscheidet nicht verbindlich über den materiellen Leistungsanspruch der Parteien. Diese Entscheidung obliegt im Streitfall ausschließlich den zuständigen Gerichten oder einem einvernehmlich bestellten Schlichter.\n(3) PDR Connect verpflichtet sich, nach besten Kräften auf eine gütliche Einigung hinzuwirken.',
        },
        {
          h: '§11 Plattformverfügbarkeit',
          p: '(1) PDR Connect bemüht sich um eine möglichst hohe Verfügbarkeit der Plattform, übernimmt jedoch keine Gewähr für eine jederzeit unterbrechungsfreie Nutzung.\n(2) Wartungsarbeiten, technische Störungen oder Ausfälle, die außerhalb des Einflussbereichs von PDR Connect liegen, begründen keine Ansprüche gegenüber PDR Connect, sofern PDR Connect diese nicht zu vertreten hat.\n(3) Im Falle geplanter Wartungsarbeiten wird PDR Connect den Kunden möglichst frühzeitig informieren.',
        },
        {
          h: '§12 Laufzeit und Kündigung',
          p: '(1) Dieser Vertrag gilt ab dem Datum der Kundenregistrierung auf der PDR Connect Plattform auf unbestimmte Zeit.\n(2) Jede Partei kann diesen Vertrag mit einer Frist von 14 Tagen in Textform (E-Mail an info@cybratech-solutions.com) kündigen.\n(3) Eine Kündigung berührt nicht bestehende Zahlungsverpflichtungen aus laufenden oder abgeschlossenen Einsätzen.\n(4) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Als wichtiger Grund gilt insbesondere eine schwerwiegende Verletzung der Plattformregeln oder eine Zahlungsumgehung.',
        },
        {
          h: '§13 Vertragsänderungen',
          p: '(1) PDR Connect ist berechtigt, diese Vertragsbedingungen zu ändern, soweit dies aus sachlichen Gründen erforderlich ist (z.B. gesetzliche Änderungen, technische Weiterentwicklung, Marktveränderungen).\n(2) Wesentliche Änderungen werden dem Kunden mindestens 30 Tage vor Inkrafttreten in Textform (E-Mail) mitgeteilt.\n(3) Der Kunde hat das Recht, den Vertrag bis zum Zeitpunkt des Inkrafttretens der Änderung fristlos zu kündigen. Macht der Kunde von diesem Kündigungsrecht keinen Gebrauch und nutzt die Plattform nach Inkrafttreten der Änderungen weiter, gilt dies als Zustimmung zu den geänderten Bedingungen.\n(4) Nicht wesentliche Änderungen (z.B. redaktionelle Anpassungen, Klarstellungen) können ohne Vorankündigung vorgenommen werden.',
        },
        {
          h: '§14 Anwendbares Recht und Gerichtsstand',
          p: '(1) Dieser Vertrag unterliegt dem Recht der Republik Zypern unter Ausschluss des UN-Kaufrechts (CISG).\n(2) Soweit gesetzlich zulässig, ist ausschließlicher Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag Nikosia, Republik Zypern.\n(3) Zwingende gesetzliche Gerichtsstände, insbesondere Verbraucherschutzvorschriften der EU oder der Mitgliedstaaten, bleiben von vorstehender Regelung unberührt. In diesen Fällen sind die gesetzlich vorgeschriebenen Gerichtsstände maßgeblich.\n(4) Die EU-Kommission stellt unter https://ec.europa.eu/consumers/odr/ eine Plattform zur Online-Streitbeilegung bereit.',
        },
        {
          h: '§15 Salvatorische Klausel',
          p: 'Sollte eine Bestimmung dieses Vertrages ganz oder teilweise unwirksam oder undurchführbar sein oder werden, so bleibt die Wirksamkeit der übrigen Bestimmungen hiervon unberührt. Die unwirksame oder undurchführbare Bestimmung ist durch eine wirksame Regelung zu ersetzen, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.',
        },
      ],
    },

    /* ── WORKER (TECHNIKER) ── */
    worker: {
      title: 'Vermittlungs- und Dienstleistungsvertrag',
      badge: 'Techniker-/Fachkraft-Version',
      printBtn: 'Drucken / Als PDF speichern',
      parties: {
        label: 'Vertragsparteien',
        operator: 'PDR Connect, betrieben von Cybratech Solutions Ltd., Efesou 9, 5280 Paralimni, Republik Zypern, USt-IdNr. CY60015676H — nachfolgend „PDR Connect"',
        client: 'Die auf der Plattform registrierte natürliche Person (Fachkraft/Techniker) — nachfolgend „Techniker"',
      },
      intro: 'Dieser Vermittlungs- und Dienstleistungsvertrag (nachfolgend „Vertrag") regelt das Rechtsverhältnis zwischen PDR Connect und dem Techniker hinsichtlich der Nutzung der PDR Connect Plattform sowie der damit verbundenen Vermittlungsleistungen. Mit der Registrierung auf der PDR Connect Plattform erklärt der Techniker sein rechtsverbindliches Einverständnis mit diesem Vertrag.',
      sections: [
        {
          h: '§1 Vertragsgegenstand',
          p: 'PDR Connect erbringt Personalvermittlungsdienstleistungen und vermittelt den Techniker an Kundenunternehmen, die qualifizierte Kfz-Fachkräfte benötigen, über die PDR Connect Plattform (pdrconnect.eu). PDR Connect ist dabei ausschließlich als Vermittler tätig und wird nicht selbst Vertragspartner des zwischen Techniker und Auftraggeber geschlossenen Auftragsvertrages.',
        },
        {
          h: '§2 Von PDR Connect erbrachte Leistungen',
          p: 'PDR Connect erbringt für den Techniker insbesondere folgende Leistungen:',
          list: [
            'Aktive Vermarktung des Technikerprofils gegenüber registrierten Kundenunternehmen',
            'Erleichterung sicherer Kommunikation zwischen Techniker und potenziellen Auftraggebern über die Plattform',
            'Ausstellung aller Rechnungen an Auftraggeber und vollständige Abwicklung der Zahlungsströme',
            'Überweisung der Technikervergütung (abzüglich Plattformgebühr gemäß §3) nach geprüftem Zahlungseingang',
            'Unterstützung und Beratung während des gesamten Vermittlungsprozesses',
          ],
        },
        {
          h: '§3 Plattformgebühr — Techniker',
          p: '(1) PDR Connect behält als Vergütung für seine Vermittlungs- und Verwaltungsleistungen eine Plattformdienstleistungsgebühr von 10 % des vereinbarten Gesamtauftragswertes (netto) ein.\n(2) Diese Gebühr wird vom vereinbarten Bruttobetrag abgezogen, bevor die Zahlung an den Techniker überwiesen wird.\n(3) Rechenbeispiel: Bei einem vereinbarten Auftragswert von 1.000 € (netto) behält PDR Connect 100 € (10 %) als Vermittlungsgebühr ein. Der Techniker erhält 900 €.\n(4) Die Plattformgebühr umfasst: Profilvermarktung und Sichtbarkeit, Kundenakquise und -matching, sichere Kommunikationsinfrastruktur, Rechnungs- und Vertragsverwaltung sowie Zahlungsabwicklung.\n(5) PDR Connect behält sich vor, die Plattformgebühr anzupassen. Eine Anpassung wird dem Techniker mindestens 30 Tage vor Inkrafttreten mitgeteilt. Der Techniker hat das Recht, den Vertrag bis zum Inkrafttreten der Anpassung fristlos zu kündigen.',
        },
        {
          h: '§4 Zahlungsbedingungen',
          p: '(1) PDR Connect überweist die Vergütung des Technikers innerhalb von 7 Werktagen, nachdem (a) die vollständige Zahlung des Auftraggebers bei PDR Connect eingegangen ist, (b) der Techniker eine ordnungsgemäße Rechnung gestellt hat und (c) PDR Connect diese Rechnung geprüft und freigegeben hat.\n(2) Der Techniker ist berechtigt, eine Rechnung an PDR Connect (Cybratech Solutions Ltd.) ausschließlich dann auszustellen, nachdem er von PDR Connect ausdrücklich darüber informiert wurde, dass der vollständige Zahlungseingang des Auftraggebers bestätigt wurde. Vor dieser Benachrichtigung ausgestellte Rechnungen sind nicht fällig und werden nicht bearbeitet.\n(3) Alle Rechnungen sind auszustellen an: Cybratech Solutions Ltd. · Efesou 9, 5280 Paralimni, Zypern · USt-IdNr.: CY60015676H.\n(4) Der Techniker ist nicht berechtigt, direkte Zahlungen von Auftraggebern außerhalb der PDR Connect Plattform anzufordern, anzunehmen oder zu vermitteln. Ein solches Verhalten stellt einen schwerwiegenden Vertragsbruch dar und berechtigt PDR Connect zur fristlosen Kündigung und Geltendmachung von Schadensersatz.\n(5) Bei begründetem Verdacht auf Zahlungsumgehung oder sonstigen Unregelmäßigkeiten ist PDR Connect berechtigt, ausstehende Zahlungen zurückzuhalten, soweit dies zur Sachverhaltsklärung erforderlich ist. Nach Abschluss der Prüfung werden unstreitige Beträge unverzüglich ausgezahlt. Das Recht auf Sperrung des Profils und Geltendmachung weiterer Ansprüche bleibt vorbehalten.\n(6) Freigegebene Vergütungen werden ausschließlich auf das Bankkonto überwiesen, das der Techniker in seinem Plattformprofil hinterlegt hat. Der Techniker ist verpflichtet, seine Bankverbindung stets aktuell zu halten und trägt das alleinige Risiko bei unrichtigen oder veralteten Angaben.',
        },
        {
          h: '§5 Technikerpflichten',
          list: [
            'Pflege eines vollständigen, wahrheitsgemäßen und aktuellen Profils mit allen relevanten Qualifikationen, Zertifikaten und Verfügbarkeiten',
            'Hochladen und laufende Aktualisierung aller erforderlichen Dokumente (Personalausweis oder Reisepass, A1-Bescheinigung wo erforderlich, Berufsqualifikationsnachweise)',
            'Einhaltung aller zugesagten Einsätze und vereinbarten Auftragsbedingungen',
            'Ausschließliche Nutzung der PDR Connect Plattform für die Kommunikation mit Auftraggebern — kein Austausch privater Kontaktdaten',
            'Unverzügliche Benachrichtigung von PDR Connect, wenn ein zugesagter Einsatz nicht angetreten werden kann',
            'Professionelles Verhalten und Einhaltung anerkannter Branchenstandards bei allen Einsätzen',
          ],
        },
        {
          h: '§6 Berufsstandards und Qualifikationen',
          p: '(1) Der Techniker versichert, dass alle angegebenen Qualifikationen, Berufserfahrungen und Zertifikate wahrheitsgemäß, echt und aktuell sind. Falschangaben berechtigen PDR Connect zur fristlosen Kündigung und Geltendmachung von Schadensersatz.\n(2) Der Techniker verpflichtet sich, alle Arbeiten entsprechend den anerkannten Regeln der Technik und professionellen Branchenstandards durchzuführen.\n(3) PDR Connect ist berechtigt, das Profil eines Technikers bei nachgewiesenem professionellen Fehlverhalten, Urkundenfälschung oder wiederholten schwerwiegenden Verstößen gegen diesen Vertrag vorübergehend zu sperren oder dauerhaft zu löschen.',
        },
        {
          h: '§7 Status als selbstständiger Dienstleister',
          p: '(1) Der Techniker ist als selbstständiger Unternehmer (Dienstleister) tätig. Dieser Vertrag begründet kein Arbeitsverhältnis, kein arbeitnehmerähnliches Verhältnis und keine sonstige Abhängigkeit im Sinne des Arbeitsrechts zwischen dem Techniker und PDR Connect.\n(2) Der Techniker ist allein verantwortlich für:\n• Ordnungsgemäße steuerliche Anmeldung und Abführung aller Steuern (Einkommensteuer, Umsatzsteuer etc.) in seinem jeweiligen Ansässigkeitsstaat\n• Zahlung von Sozialversicherungsbeiträgen und sonstigen gesetzlichen Abgaben\n• Abschluss einer angemessenen Berufshaftpflichtversicherung\n• Einhaltung aller anwendbaren Arbeits-, Gewerbe- und Aufenthaltsvorschriften im Einsatzland\n(3) PDR Connect erbringt keine Leistungen als Arbeitgeber. Insbesondere werden keine Sozialversicherungsbeiträge abgeführt, kein Urlaub gewährt und keine Lohnfortzahlung im Krankheitsfall geleistet.',
        },
        {
          h: '§8 Datenschutz und DSGVO',
          p: '(1) PDR Connect verarbeitet personenbezogene Daten des Technikers zur Erfüllung dieses Vertrages und zur Erbringung der Vermittlungsleistungen.\n(2) Die Verarbeitung personenbezogener Daten erfolgt gemäß der jeweils aktuellen Datenschutzerklärung von PDR Connect sowie der Verordnung (EU) 2016/679 des Europäischen Parlaments und des Rates vom 27. April 2016 (Datenschutz-Grundverordnung — DSGVO).\n(3) Der Techniker hat folgende Rechte gemäß DSGVO:\n• Auskunftsrecht (Art. 15 DSGVO)\n• Recht auf Berichtigung (Art. 16 DSGVO)\n• Recht auf Löschung / „Recht auf Vergessenwerden" (Art. 17 DSGVO)\n• Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)\n• Recht auf Datenübertragbarkeit (Art. 20 DSGVO)\n• Widerspruchsrecht (Art. 21 DSGVO)\n(4) Zur Wahrnehmung dieser Rechte oder bei Datenschutzanfragen wenden Sie sich an: datenschutz@cybratech-solutions.com\n(5) Weitergabe von Technikerdaten an Dritte (insbesondere Auftraggeber) erfolgt nur im für die Vermittlung erforderlichen Umfang oder soweit gesetzlich vorgeschrieben.',
        },
        {
          h: '§9 Vertraulichkeit',
          p: '(1) Der Techniker verpflichtet sich, alle Informationen über Auftraggeber, konkrete Auftragsdetails, vereinbarte Konditionen und sonstige ihm im Zusammenhang mit der Plattformnutzung bekannt gewordene Geschäftsinformationen vertraulich zu behandeln.\n(2) Diese Vertraulichkeitsverpflichtung gilt über die Vertragslaufzeit hinaus für einen Zeitraum von drei (3) Jahren nach Vertragsende.\n(3) PDR Connect behandelt alle persönlichen und beruflichen Daten des Technikers ebenfalls vertraulich und gibt diese nicht ohne Zustimmung des Technikers an Dritte weiter, soweit dies nicht zur Vertragserfüllung erforderlich ist.',
        },
        {
          h: '§10 Haftung',
          p: '(1) PDR Connect haftet unbeschränkt für Schäden, die auf Vorsatz oder grober Fahrlässigkeit von PDR Connect, seiner gesetzlichen Vertreter oder leitenden Angestellten beruhen, sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.\n(2) Bei einfacher Fahrlässigkeit haftet PDR Connect nur bei Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht), deren Erfüllung die ordnungsgemäße Durchführung des Vertrages überhaupt erst ermöglicht und auf deren Einhaltung der Techniker regelmäßig vertrauen darf. In diesen Fällen ist die Haftung auf den bei Vertragsschluss typischerweise vorhersehbaren, vertragstypischen Schaden begrenzt.\n(3) Eine weitergehende Haftung von PDR Connect ist ausgeschlossen. Insbesondere übernimmt PDR Connect keine Haftung für:\n• Ausfall oder Verzögerung von Zahlungen durch Auftraggeber\n• Qualitätsstreitigkeiten zwischen Techniker und Auftraggeber\n• Entgangenen Gewinn, mittelbare Schäden oder Folgeschäden\n• Schäden aufgrund höherer Gewalt oder technischer Ausfälle der Plattform\n(4) Die vorstehenden Haftungsbeschränkungen gelten nicht, soweit zwingendes Verbraucher- oder EU-Recht eine strengere Haftung vorschreibt.',
        },
        {
          h: '§11 Streitbeilegung und Zahlungsrückhalte',
          p: '(1) Bei Streitigkeiten zwischen Auftraggeber und Techniker über die Qualität, den Umfang oder die Abrechnung erbrachter Leistungen kann PDR Connect betroffene Zahlungen bis zur abschließenden Klärung des Sachverhalts vorübergehend zurückhalten.\n(2) PDR Connect entscheidet nicht verbindlich über den materiellen Leistungsanspruch der Parteien. Kommt innerhalb von 30 Tagen keine gütliche Einigung zustande, werden die streitigen Beträge auf Treuhandkonto gehalten, bis eine gerichtliche oder schiedsgerichtliche Entscheidung vorliegt.\n(3) Unstreitige Teilbeträge werden innerhalb von 7 Werktagen nach Feststellung der Unstrittigkeit ausgezahlt.\n(4) PDR Connect empfiehlt als außergerichtliche Streitbeilegung die EU-Plattform für Online-Streitbeilegung (ODR): https://ec.europa.eu/consumers/odr/',
        },
        {
          h: '§12 Plattformverfügbarkeit',
          p: '(1) PDR Connect ist bestrebt, eine möglichst hohe Verfügbarkeit der Plattform sicherzustellen, übernimmt jedoch keine Garantie für eine jederzeit unterbrechungsfreie Nutzung.\n(2) Regelmäßige Wartungsarbeiten können zu vorübergehenden Einschränkungen führen. PDR Connect informiert den Techniker über geplante Wartungsfenster soweit möglich mit angemessener Vorlauffrist.\n(3) Technische Ausfälle oder Störungen, die außerhalb des zumutbaren Einflussbereichs von PDR Connect liegen (z.B. Force Majeure, Ausfälle von Drittanbietern), begründen keine Schadensersatzansprüche gegenüber PDR Connect.',
        },
        {
          h: '§13 Laufzeit und Kündigung',
          p: '(1) Dieser Vertrag wird auf unbestimmte Zeit geschlossen und tritt mit der Registrierung des Technikers auf der PDR Connect Plattform in Kraft.\n(2) Jede Partei kann diesen Vertrag mit einer Frist von 14 Tagen in Textform (E-Mail an info@cybratech-solutions.com) ordentlich kündigen.\n(3) Die Kündigung berührt nicht bestehende Zahlungsverpflichtungen aus bereits abgeschlossenen oder laufenden Einsätzen.\n(4) Das Recht zur außerordentlichen fristlosen Kündigung aus wichtigem Grund bleibt unberührt. Als wichtiger Grund gilt für PDR Connect insbesondere:\n• Schwerwiegende oder wiederholte Verletzung von Vertragspflichten\n• Zahlungsumgehung oder versuchte Zahlungsumgehung\n• Vorlage gefälschter oder unrichtiger Dokumente\n• Betrügerisches oder strafbares Verhalten',
        },
        {
          h: '§14 Vertragsänderungen',
          p: '(1) PDR Connect ist berechtigt, diese Vertragsbedingungen zu ändern, soweit sachliche Gründe dies rechtfertigen (z.B. Gesetzesänderungen, Anpassungen der Gebührenstruktur, technische Weiterentwicklungen).\n(2) Wesentliche Änderungen werden dem Techniker mindestens 30 Tage vor ihrem Inkrafttreten in Textform (E-Mail) angekündigt. Die Mitteilung erfolgt an die im Profil hinterlegte E-Mail-Adresse.\n(3) Der Techniker hat das Recht, den Vertrag bis zum Zeitpunkt des Inkrafttretens der Änderungen fristlos zu kündigen. Macht der Techniker von diesem Sonderkündigungsrecht keinen Gebrauch und nutzt die Plattform nach Inkrafttreten weiter, gilt dies als Zustimmung zu den geänderten Bedingungen.\n(4) Redaktionelle Anpassungen ohne inhaltliche Auswirkungen auf Rechte und Pflichten der Parteien können ohne Vorankündigung vorgenommen werden.',
        },
        {
          h: '§15 Anwendbares Recht und Gerichtsstand',
          p: '(1) Dieser Vertrag unterliegt dem Recht der Republik Zypern unter Ausschluss des UN-Kaufrechts (CISG).\n(2) Soweit gesetzlich zulässig, ist Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag Nikosia, Republik Zypern.\n(3) Zwingende gesetzliche Gerichtsstände bleiben von dieser Regelung unberührt. Insbesondere werden Verbraucher- und Arbeitnehmer-Schutzvorschriften der EU sowie der Mitgliedstaaten hierdurch nicht eingeschränkt. In diesen Fällen sind die gesetzlich bestimmten Gerichtsstände maßgeblich.\n(4) Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung (ODR) bereit: https://ec.europa.eu/consumers/odr/ — PDR Connect ist zur Teilnahme an einem Schlichtungsverfahren nicht verpflichtet, wird jedoch etwaige Anfragen wohlwollend prüfen.',
        },
        {
          h: '§16 Salvatorische Klausel',
          p: 'Sollte eine Bestimmung dieses Vertrages ganz oder teilweise unwirksam oder undurchführbar sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen hiervon unberührt. Die unwirksame oder undurchführbare Bestimmung ist durch eine wirksame Regelung zu ersetzen, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt. Entsprechendes gilt für etwaige Vertragslücken.',
        },
      ],
    },
  },

  /* ═══════════════════════════════════════════════════════════
     ENGLISH  (EN)
  ═══════════════════════════════════════════════════════════ */
  en: {
    pageTitle: 'Platform Contracts',
    pageSubtitle: 'Two contract versions — for Clients and for Technicians/Workers',
    tabClient: '🏢 For Clients / Contractors',
    tabWorker: '🔧 For Technicians / Workers',

    /* ── CLIENT ── */
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
          p: 'PDR Connect provides professional talent placement services, sourcing and presenting verified PDR technicians and automotive professionals to the Client through the PDR Connect platform (pdrconnect.eu). PDR Connect acts exclusively as an intermediary and does not itself become a party to the service contract concluded between the Client and the Technician.',
        },
        {
          h: '§2 Services Provided by PDR Connect',
          p: 'PDR Connect provides the following services to the Client:',
          list: [
            'Identification and presentation of verified technicians matching the Client\'s requirements',
            'Verification of professional credentials, certifications, and identity documents',
            'Facilitation of secure communication between Client and Technician via the platform',
            'Issuance of all invoices and processing of all payments',
            'Ongoing support and assistance throughout the placement process',
          ],
        },
        {
          h: '§3 Platform Service — Client (Currently Free)',
          p: '(1) During the current launch phase, PDR Connect provides its placement services to Clients free of charge. No platform service fee is charged to the Client.\n(2) Clients pay only the agreed technician remuneration as invoiced by PDR Connect. No additional platform surcharge applies.\n(3) Example: If the agreed technician remuneration is €1,000, the Client is invoiced for exactly €1,000.\n(4) PDR Connect reserves the right to introduce a platform service fee for Clients in the future with at least 30 days\' advance written notice. The Client has the right to terminate this Agreement free of charge up to the date the change takes effect.',
        },
        {
          h: '§4 Payment Terms',
          p: '(1) As a Client you have free access to our platform. If a payment obligation arises, the following terms apply:\n(2) All invoices are payable within 14 days of the invoice date to: Cybratech Solutions Ltd. · Efesou 9, 5280 Paralimni, Cyprus · VAT: CY60015676H.\n(3) All payments must be transferred exclusively to PDR Connect. Direct payments to Technicians outside the platform are strictly prohibited.\n(4) In the event of suspected payment circumvention, PDR Connect is entitled to withhold payments to the extent necessary to investigate the matter. Once the investigation is concluded, undisputed amounts will be released without undue delay. PDR Connect reserves the right to suspend the account and pursue further legal remedies.\n(5) Late payments may be subject to statutory interest under EU Directive 2011/7/EU on combating late payment or applicable national law.',
        },
        {
          h: '§5 Client Obligations',
          list: [
            'Provide accurate and complete job requirements when requesting placements',
            'Ensure a safe, legal, and professionally appropriate working environment for all placed technicians',
            'Comply with all applicable labour, tax, and social security laws in the country where the technician performs work',
            'Honour all agreed assignment terms including duration, scope, and remuneration',
            'Conduct all communications with Technicians exclusively through the PDR Connect platform',
            'Not establish any direct employment or service relationships with placed technicians outside PDR Connect',
          ],
        },
        {
          h: '§6 Technician Verification & Warranty',
          p: '(1) PDR Connect warrants that all presented technicians have been identity-verified through official documentation.\n(2) PDR Connect does not guarantee specific work outcomes, productivity levels, or project results.\n(3) The Client is responsible for assessing the suitability of presented technicians for their specific requirements.',
        },
        {
          h: '§7 Data Protection & GDPR',
          p: '(1) PDR Connect processes the Client\'s personal data solely for the purpose of performing this Agreement and providing placement services.\n(2) The processing of personal data is carried out in accordance with PDR Connect\'s current Privacy Policy and Regulation (EU) 2016/679 (General Data Protection Regulation — GDPR).\n(3) The Client has the following rights under GDPR: right of access (Art. 15), right to rectification (Art. 16), right to erasure (Art. 17), right to restriction of processing (Art. 18), right to data portability (Art. 20), and right to object (Art. 21). Requests should be directed to: datenschutz@cybratech-solutions.com\n(4) Client data will only be shared with third parties to the extent necessary for the performance of this Agreement or as required by law.',
        },
        {
          h: '§8 Confidentiality',
          p: '(1) Both Parties agree to keep all commercial terms, pricing, and assignment details strictly confidential.\n(2) This confidentiality obligation survives termination of this Agreement for a period of three (3) years.',
        },
        {
          h: '§9 Liability',
          p: '(1) PDR Connect shall be liable without limitation for damages caused by intentional misconduct or gross negligence, and for damages arising from injury to life, body, or health.\n(2) For cases of ordinary negligence, PDR Connect shall only be liable for breach of a material contractual obligation (cardinal obligation) whose fulfilment is essential for the proper performance of the Agreement and on whose observance the Client may regularly rely. In such cases, liability is limited to typically foreseeable damage.\n(3) Any further liability of PDR Connect is excluded. This includes in particular lost profits, indirect damages, and consequential losses.\n(4) The above limitations do not apply where mandatory consumer protection or EU law requires stricter liability.',
        },
        {
          h: '§10 Dispute Resolution',
          p: '(1) In the event of disputes between Client and Technician regarding the quality or scope of services rendered, PDR Connect may temporarily withhold relevant payments pending clarification of the matter.\n(2) PDR Connect does not issue binding decisions on the merits of the parties\' claims. Such decisions are reserved for the competent courts or an agreed arbitrator.\n(3) PDR Connect will make reasonable efforts to facilitate an amicable resolution. The EU ODR platform is available at: https://ec.europa.eu/consumers/odr/',
        },
        {
          h: '§11 Platform Availability',
          p: '(1) PDR Connect endeavours to provide the highest possible platform availability but does not guarantee uninterrupted access at all times.\n(2) Planned maintenance windows will be communicated to users in advance where possible. Force majeure events or third-party infrastructure failures beyond PDR Connect\'s reasonable control do not give rise to liability.\n(3) PDR Connect shall not be liable for any losses arising from temporary unavailability of the platform unless caused by PDR Connect\'s own fault.',
        },
        {
          h: '§12 Term and Termination',
          p: '(1) This Agreement is effective from the date of Client registration and continues for an indefinite period.\n(2) Either Party may terminate this Agreement with 14 days\' written notice by email to info@cybratech-solutions.com.\n(3) Termination does not affect payment obligations for ongoing or completed assignments.\n(4) Either Party may terminate immediately for cause. Cause includes, but is not limited to, material breach of this Agreement or payment circumvention.',
        },
        {
          h: '§13 Amendments',
          p: '(1) PDR Connect may amend these terms where there are objective grounds for doing so (e.g. legal changes, fee structure adjustments, technical developments).\n(2) Material amendments will be communicated at least 30 days before taking effect.\n(3) The Client has the right to terminate this Agreement free of charge up to the date the amendment takes effect. Continued use of the platform after that date constitutes acceptance.\n(4) Non-material amendments (editorial corrections, clarifications) may be made without prior notice.',
        },
        {
          h: '§14 Governing Law and Jurisdiction',
          p: '(1) This Agreement is governed by the laws of the Republic of Cyprus, excluding the UN Convention on Contracts for the International Sale of Goods (CISG).\n(2) To the extent permitted by law, the exclusive jurisdiction for all disputes arising from or in connection with this Agreement shall be the courts of Nicosia, Republic of Cyprus.\n(3) Mandatory statutory jurisdictions — in particular consumer protection provisions under EU law — remain unaffected. The EU ODR platform is available at: https://ec.europa.eu/consumers/odr/',
        },
        {
          h: '§15 Severability',
          p: 'Should any provision of this Agreement be or become wholly or partially invalid or unenforceable, this shall not affect the validity of the remaining provisions. The invalid or unenforceable provision shall be replaced by a valid provision that most closely achieves the economic purpose of the invalid provision.',
        },
      ],
    },

    /* ── WORKER ── */
    worker: {
      title: 'Placement & Service Agreement',
      badge: 'Technician / Worker Version',
      printBtn: 'Print / Save as PDF',
      parties: {
        label: 'Parties',
        operator: 'PDR Connect, operated by Cybratech Solutions Ltd., Efesou 9, 5280 Paralimni, Republic of Cyprus, VAT No. CY60015676H — hereinafter "PDR Connect"',
        client: 'The individual professional registered on the platform — hereinafter "Technician"',
      },
      intro: 'This Placement and Service Agreement (hereinafter "Agreement") governs the legal relationship between PDR Connect and the Technician regarding the use of the PDR Connect platform and associated placement services. By registering on the PDR Connect platform, the Technician agrees to be legally bound by this Agreement.',
      sections: [
        {
          h: '§1 Subject of Agreement',
          p: 'PDR Connect provides professional placement services, matching the Technician with client businesses requiring skilled automotive professionals, through the PDR Connect platform (pdrconnect.eu). PDR Connect acts exclusively as an intermediary and does not itself become a party to the service contract concluded between the Technician and the Client.',
        },
        {
          h: '§2 Services Provided by PDR Connect',
          p: 'PDR Connect provides the following services to the Technician:',
          list: [
            'Active promotion of the Technician\'s profile to registered client businesses',
            'Facilitation of secure communication between Technician and potential Clients via the platform',
            'Issuance of all invoices to Clients and processing of all payment flows',
            'Transfer of the Technician\'s net earnings (after platform fee per §3) following verified receipt of payment',
            'Support and guidance throughout the placement process',
          ],
        },
        {
          h: '§3 Platform Service Fee',
          p: '(1) PDR Connect retains a platform service fee of 10% of the total agreed net assignment value as a placement and administration fee.\n(2) This fee is deducted from the agreed gross amount before payment is transferred to the Technician.\n(3) Example: For an assignment value of €1,000 (net), PDR Connect retains €100 (10%). The Technician receives €900.\n(4) The fee covers: profile marketing and visibility, client matching, secure communication infrastructure, contract and invoice management, and payment processing.\n(5) PDR Connect reserves the right to adjust the platform fee with at least 30 days\' advance written notice. The Technician has the right to terminate this Agreement free of charge up to the date the adjustment takes effect.',
        },
        {
          h: '§4 Payment Terms',
          p: '(1) PDR Connect will transfer the Technician\'s remuneration within 7 business days after: (a) full payment from the Client has been received by PDR Connect, (b) the Technician has submitted a proper invoice, and (c) PDR Connect has reviewed and approved that invoice.\n(2) The Technician is entitled to submit an invoice to PDR Connect (Cybratech Solutions Ltd.) only after being formally notified by PDR Connect that the Client\'s full payment has been confirmed. Invoices submitted before such notification are not due and will not be processed.\n(3) All invoices must be addressed to: Cybratech Solutions Ltd. · Efesou 9, 5280 Paralimni, Cyprus · VAT: CY60015676H.\n(4) The Technician must not request, accept, or facilitate direct payments from Clients that bypass the PDR Connect platform. Such conduct constitutes a serious breach of this Agreement and entitles PDR Connect to immediate termination and damages.\n(5) In the event of suspected payment circumvention or other irregularities, PDR Connect is entitled to withhold pending payments to the extent necessary to investigate the matter. Once the investigation is concluded, undisputed amounts will be released without undue delay. PDR Connect reserves the right to suspend the Technician\'s profile and pursue further legal remedies.\n(6) Approved earnings are transferred exclusively to the bank account provided by the Technician in their platform profile. The Technician bears sole responsibility for maintaining accurate and current banking details.',
        },
        {
          h: '§5 Technician Obligations',
          list: [
            'Maintain a complete, truthful, and up-to-date profile including all relevant qualifications, certifications, and availability',
            'Upload and continuously update all required documents (ID/passport, A1 certificate where applicable, professional qualification certificates)',
            'Honour all accepted placements and agreed assignment terms',
            'Use the PDR Connect platform exclusively for communication with Clients — no exchange of private contact details',
            'Notify PDR Connect immediately if an accepted assignment cannot be fulfilled',
            'Maintain professional conduct and recognised industry standards throughout all assignments',
          ],
        },
        {
          h: '§6 Professional Standards and Qualifications',
          p: '(1) The Technician warrants that all stated qualifications, experience, and certifications are truthful, genuine, and current. Misrepresentation entitles PDR Connect to immediate termination and damages.\n(2) The Technician agrees to perform all work in accordance with recognised technical standards and professional industry practices.\n(3) PDR Connect is entitled to suspend or permanently remove a Technician\'s profile in cases of verified professional misconduct, document fraud, or repeated material breaches of this Agreement.',
        },
        {
          h: '§7 Independent Contractor Status',
          p: '(1) The Technician operates as an independent self-employed service provider. This Agreement does not create an employment relationship, employee-like relationship, or any other dependency under employment law between the Technician and PDR Connect.\n(2) The Technician is solely responsible for:\n• Proper tax registration and payment of all applicable taxes (income tax, VAT, etc.) in their country of residence\n• Payment of social security contributions and other statutory levies\n• Obtaining adequate professional indemnity insurance\n• Compliance with all applicable labour, business licensing, and immigration regulations in the country of work\n(3) PDR Connect does not act as an employer and does not make social security contributions, provide paid leave, or pay sick pay on behalf of the Technician.',
        },
        {
          h: '§8 Data Protection & GDPR',
          p: '(1) PDR Connect processes the Technician\'s personal data solely for the purpose of performing this Agreement and providing placement services.\n(2) The processing of personal data is carried out in accordance with PDR Connect\'s current Privacy Policy and Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 (General Data Protection Regulation — GDPR).\n(3) The Technician has the following rights under GDPR: right of access (Art. 15), right to rectification (Art. 16), right to erasure (Art. 17), right to restriction of processing (Art. 18), right to data portability (Art. 20), and right to object (Art. 21). Requests should be directed to: datenschutz@cybratech-solutions.com\n(4) The Technician\'s data will only be shared with third parties (in particular Clients) to the extent necessary for providing the placement service or as required by law.',
        },
        {
          h: '§9 Confidentiality',
          p: '(1) The Technician agrees to keep all Client information, assignment details, agreed terms, and any other business information received through the use of the platform strictly confidential.\n(2) This confidentiality obligation survives termination of this Agreement for a period of three (3) years.\n(3) PDR Connect likewise treats all personal and professional data of the Technician as confidential and will not share it with third parties without the Technician\'s consent except where necessary for the performance of this Agreement.',
        },
        {
          h: '§10 Liability',
          p: '(1) PDR Connect shall be liable without limitation for damages caused by intentional misconduct or gross negligence by PDR Connect, its legal representatives, or senior employees, and for damages arising from injury to life, body, or health.\n(2) For cases of ordinary (simple) negligence, PDR Connect shall only be liable for breach of a material contractual obligation (cardinal obligation) whose fulfilment is essential to the proper performance of the Agreement and on whose observance the Technician may regularly rely. In such cases, liability is limited to the typically foreseeable damage at the time of contract formation.\n(3) Any further liability of PDR Connect is excluded. This includes in particular:\n• Delayed or failed payment by Clients\n• Quality or performance disputes between Technician and Client\n• Lost profits, indirect damages, or consequential losses\n• Damages due to force majeure or third-party infrastructure failures\n(4) The above limitations do not apply where mandatory consumer protection or EU law requires stricter liability.',
        },
        {
          h: '§11 Dispute Resolution & Payment Retention',
          p: '(1) In the event of disputes between Client and Technician regarding the quality, scope, or billing of services, PDR Connect may temporarily retain relevant payments pending resolution of the matter.\n(2) PDR Connect does not issue binding decisions on the merits of the parties\' substantive claims. If no amicable resolution is reached within 30 days, disputed amounts will be held in escrow pending a court or arbitration decision.\n(3) Undisputed partial amounts will be released within 7 business days of being established as undisputed.\n(4) For out-of-court dispute resolution, the EU Online Dispute Resolution (ODR) platform is available at: https://ec.europa.eu/consumers/odr/',
        },
        {
          h: '§12 Platform Availability',
          p: '(1) PDR Connect endeavours to maintain the highest possible platform availability but does not guarantee uninterrupted access at all times.\n(2) Planned maintenance windows will be communicated to users in advance where reasonably possible. Unplanned outages due to force majeure or failures beyond PDR Connect\'s reasonable control do not give rise to claims against PDR Connect.\n(3) PDR Connect shall not be liable for any losses arising from temporary unavailability of the platform unless directly caused by PDR Connect\'s own fault.',
        },
        {
          h: '§13 Term and Termination',
          p: '(1) This Agreement takes effect upon the Technician\'s registration on the PDR Connect platform and continues for an indefinite period.\n(2) Either Party may terminate this Agreement with 14 days\' written notice by email to info@cybratech-solutions.com.\n(3) Termination does not affect payment obligations for completed or ongoing assignments.\n(4) The right to terminate immediately for good cause remains unaffected. Good cause for PDR Connect includes in particular:\n• Material or repeated breach of contractual obligations\n• Payment circumvention or attempted circumvention\n• Submission of falsified or inaccurate documents\n• Fraudulent or criminal conduct',
        },
        {
          h: '§14 Amendments',
          p: '(1) PDR Connect may amend these terms where there are objective grounds for doing so (e.g. legislative changes, fee structure adjustments, technical developments).\n(2) Material amendments will be communicated to the Technician at least 30 days before taking effect, by email to the address registered in the Technician\'s profile.\n(3) The Technician has the right to terminate this Agreement free of charge up to the date the amendment takes effect. Continued use of the platform after that date constitutes acceptance of the amended terms.\n(4) Non-material amendments (editorial corrections, clarifications without substantive effect) may be made without prior notice.',
        },
        {
          h: '§15 Governing Law and Jurisdiction',
          p: '(1) This Agreement is governed by the laws of the Republic of Cyprus, excluding the UN Convention on Contracts for the International Sale of Goods (CISG).\n(2) To the extent permitted by law, the courts of Nicosia, Republic of Cyprus shall have exclusive jurisdiction for all disputes arising from or in connection with this Agreement.\n(3) Mandatory statutory jurisdictions remain unaffected — in particular, consumer and worker protection provisions of the EU and individual member states are not restricted by this clause. Where applicable EU or national law prescribes a specific jurisdiction, that jurisdiction shall prevail.\n(4) The EU ODR platform is available at: https://ec.europa.eu/consumers/odr/ — PDR Connect is not obliged to participate in arbitration proceedings but will consider any such request in good faith.',
        },
        {
          h: '§16 Severability',
          p: 'Should any provision of this Agreement be or become wholly or partially invalid or unenforceable, this shall not affect the validity of the remaining provisions. The invalid or unenforceable provision shall be replaced by a valid provision that most closely achieves the economic purpose intended by the invalid provision. The same applies to any gaps in the Agreement.',
        },
      ],
    },
  },

  /* ═══════════════════════════════════════════════════════════
     GREEK  (EL)
  ═══════════════════════════════════════════════════════════ */
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
        { h: '§1 Αντικείμενο', p: 'Η PDR Connect παρέχει υπηρεσίες τοποθέτησης επαγγελματιών και ενεργεί αποκλειστικά ως μεσολαβητής. Η PDR Connect δεν καθίσταται μέρος της σύμβασης που συνάπτεται μεταξύ Πελάτη και Τεχνικού.' },
        { h: '§2 Παρεχόμενες Υπηρεσίες', list: ['Εντοπισμός επαληθευμένων τεχνικών', 'Επαλήθευση εγγράφων και προσόντων', 'Ασφαλής επικοινωνία μέσω πλατφόρμας', 'Έκδοση τιμολογίων και διαχείριση πληρωμών', 'Συνεχής υποστήριξη'] },
        { h: '§3 Αμοιβή — Πελάτης (Δωρεάν)', p: 'Κατά τη φάση εκκίνησης δεν χρεώνεται αμοιβή πλατφόρμας. Ο Πελάτης πληρώνει μόνο τη συμφωνηθείσα αμοιβή τεχνικού. Μελλοντικές αλλαγές γνωστοποιούνται 30 ημέρες νωρίτερα με δικαίωμα καταγγελίας.' },
        { h: '§4 Όροι Πληρωμής', p: 'Σε περίπτωση παράκαμψης πληρωμής, η PDR Connect δικαιούται να παρακρατεί πληρωμές μόνο στο αναγκαίο μέτρο για τη διερεύνηση. Τα αδιαμφισβήτητα ποσά αποδίδονται αμέσως μετά. Τόκοι υπερημερίας σύμφωνα με Οδηγία ΕΕ 2011/7/ΕΕ.' },
        { h: '§5 Υποχρεώσεις Πελάτη', list: ['Ακριβείς απαιτήσεις εργασίας', 'Ασφαλές εργασιακό περιβάλλον', 'Συμμόρφωση με εργατική νομοθεσία', 'Τήρηση συμφωνηθέντων όρων', 'Επικοινωνία μόνο μέσω πλατφόρμας', 'Όχι άμεσες σχέσεις με τεχνικούς'] },
        { h: '§6 Επαλήθευση Τεχνικού', p: 'Η PDR Connect βεβαιώνει ταυτοτική επαλήθευση αλλά δεν εγγυάται αποτελέσματα εργασίας. Ο Πελάτης αξιολογεί την καταλληλότητα.' },
        { h: '§7 Προστασία Δεδομένων & ΓΚΠΔ', p: 'Επεξεργασία δεδομένων σύμφωνα με Κανονισμό (ΕΕ) 2016/679 (ΓΚΠΔ) και Πολιτική Απορρήτου PDR Connect. Δικαιώματα: πρόσβαση (Αρθ. 15), διόρθωση (Αρθ. 16), διαγραφή (Αρθ. 17), φορητότητα (Αρθ. 20). Επικοινωνία: datenschutz@cybratech-solutions.com' },
        { h: '§8 Εμπιστευτικότητα', p: 'Εμπιστευτικότητα όλων των εμπορικών όρων για 3 χρόνια μετά τη λήξη της σύμβασης.' },
        { h: '§9 Ευθύνη', p: 'Απεριόριστη ευθύνη για δόλο, βαριά αμέλεια, σωματικές βλάβες. Για ελαφρά αμέλεια μόνο κατά παραβίαση ουσιωδών υποχρεώσεων, περιορισμένη σε προβλέψιμες ζημίες. Ευθύνη για διαφυγόν κέρδος και επακόλουθες ζημίες αποκλείεται.' },
        { h: '§10 Επίλυση Διαφορών', p: 'Η PDR Connect δύναται να παρακρατεί πληρωμές κατά τη διάρκεια διαφορών χωρίς να αποφαίνεται επί της ουσίας. Πλατφόρμα ODR: https://ec.europa.eu/consumers/odr/' },
        { h: '§11 Διαθεσιμότητα Πλατφόρμας', p: 'Η PDR Connect αποσκοπεί σε υψηλή διαθεσιμότητα αλλά δεν εγγυάται αδιάλειπτη λειτουργία. Δεν ευθύνεται για βλάβες εκτός ελέγχου της.' },
        { h: '§12 Διάρκεια και Καταγγελία', p: 'Αόριστη διάρκεια από την εγγραφή. Καταγγελία με 14 ημέρες προειδοποίηση. Άμεση καταγγελία για σοβαρές παραβάσεις.' },
        { h: '§13 Τροποποιήσεις', p: 'Ουσιαστικές αλλαγές γνωστοποιούνται 30 ημέρες νωρίτερα με δικαίωμα καταγγελίας. Η συνέχιση χρήσης συνιστά αποδοχή.' },
        { h: '§14 Εφαρμοστέο Δίκαιο', p: 'Δίκαιο Κυπριακής Δημοκρατίας. Γεωγραφική δικαιοδοσία: Λευκωσία, εκτός υποχρεωτικών εθνικών ή ευρωπαϊκών διατάξεων προστασίας καταναλωτή.' },
        { h: '§15 Διατηρητέα Ισχύς', p: 'Εάν οποιαδήποτε διάταξη είναι άκυρη, οι υπόλοιπες παραμένουν σε ισχύ. Η άκυρη διάταξη αντικαθίσταται από έγκυρη που εξυπηρετεί τον ίδιο σκοπό.' },
      ],
    },
    worker: {
      title: 'Σύμβαση Τοποθέτησης και Υπηρεσιών',
      badge: 'Έκδοση Τεχνικού / Εργαζομένου',
      printBtn: 'Εκτύπωση / Αποθήκευση ως PDF',
      parties: {
        label: 'Συμβαλλόμενα Μέρη',
        operator: 'PDR Connect, που λειτουργεί από την Cybratech Solutions Ltd., Efesou 9, 5280 Παραλίμνι, Κυπριακή Δημοκρατία, ΑΦΜ CY60015676H — εφεξής «PDR Connect»',
        client: 'Το φυσικό πρόσωπο (επαγγελματίας/τεχνικός) εγγεγραμμένο στην πλατφόρμα — εφεξής «Τεχνικός»',
      },
      intro: 'Η παρούσα Σύμβαση Τοποθέτησης και Υπηρεσιών διέπει τη νομική σχέση μεταξύ PDR Connect και Τεχνικού. Με την εγγραφή στην πλατφόρμα PDR Connect, ο Τεχνικός αποδέχεται νομικά δεσμευτικά την παρούσα Σύμβαση.',
      sections: [
        { h: '§1 Αντικείμενο', p: 'Η PDR Connect ενεργεί αποκλειστικά ως μεσολαβητής για την τοποθέτηση τεχνικών σε επιχειρήσεις-πελάτες μέσω της πλατφόρμας pdrconnect.eu. Δεν καθίσταται συμβαλλόμενο μέρος στη σύμβαση μεταξύ Τεχνικού και Πελάτη.' },
        { h: '§2 Υπηρεσίες PDR Connect', list: ['Προώθηση προφίλ σε επιχειρήσεις-πελάτες', 'Ασφαλής επικοινωνία μέσω πλατφόρμας', 'Τιμολόγηση και διαχείριση πληρωμών', 'Μεταφορά αμοιβής μετά επαληθευμένη πληρωμή', 'Υποστήριξη καθ\' όλη τη διαδικασία'] },
        { h: '§3 Αμοιβή Πλατφόρμας', p: '10% επί της συμφωνηθείσας καθαρής αξίας. Παράδειγμα: 1.000€ → 100€ PDR Connect, 900€ Τεχνικός. Αλλαγές γνωστοποιούνται 30 ημέρες νωρίτερα με δικαίωμα καταγγελίας.' },
        { h: '§4 Όροι Πληρωμής', p: 'Πληρωμή εντός 7 εργάσιμων από επαληθευμένη είσπραξη. Τιμολόγιο μόνο μετά επίσημη γνωστοποίηση. Παράκαμψη = σοβαρή παράβαση. Παρακράτηση μόνο στο αναγκαίο μέτρο για έρευνα — αδιαμφισβήτητα ποσά αποδίδονται άμεσα.' },
        { h: '§5 Υποχρεώσεις Τεχνικού', list: ['Πλήρες και αληθές προφίλ', 'Ενημερωμένα έγγραφα (ταυτότητα, Α1, πιστοποιητικά)', 'Τήρηση αναθέσεων', 'Επικοινωνία μόνο μέσω πλατφόρμας', 'Άμεση ειδοποίηση αδυναμίας εκτέλεσης', 'Επαγγελματική συμπεριφορά'] },
        { h: '§6 Επαγγελματικά Πρότυπα', p: 'Εγγύηση αληθούς προφίλ. Εκτέλεση εργασιών κατά αναγνωρισμένα πρότυπα. Αναστολή/διαγραφή προφίλ για παραβάσεις, πλαστά έγγραφα ή επανειλημμένες παραβάσεις.' },
        { h: '§7 Ανεξάρτητος Επαγγελματίας', p: 'Δεν δημιουργείται σχέση εξαρτημένης εργασίας. Ο Τεχνικός ευθύνεται για: φορολογική συμμόρφωση, εισφορές, ασφάλιση ευθύνης, εργατική/μεταναστευτική νομοθεσία. Η PDR Connect δεν παρέχει εργοδοτικές παροχές.' },
        { h: '§8 Προστασία Δεδομένων & ΓΚΠΔ', p: 'Επεξεργασία βάσει Κανονισμού (ΕΕ) 2016/679. Δικαιώματα: πρόσβαση (Αρθ. 15), διόρθωση (Αρθ. 16), διαγραφή (Αρθ. 17), περιορισμός (Αρθ. 18), φορητότητα (Αρθ. 20), εναντίωση (Αρθ. 21). Επικοινωνία: datenschutz@cybratech-solutions.com' },
        { h: '§9 Εμπιστευτικότητα', p: 'Εμπιστευτικότητα πληροφοριών πελατών και επαγγελματικών στοιχείων για 3 χρόνια μετά τη λήξη. Αμοιβαία υποχρέωση εμπιστευτικότητας.' },
        { h: '§10 Ευθύνη', p: 'Απεριόριστη για δόλο, βαριά αμέλεια και σωματικές βλάβες. Για ελαφρά αμέλεια: μόνο κατά παραβίαση ουσιωδών υποχρεώσεων, περιορισμένη σε προβλέψιμες ζημίες. Εξαίρεση: αποτυχία πληρωμής πελατών, διαφορές ποιότητας, διαφυγόν κέρδος.' },
        { h: '§11 Επίλυση Διαφορών & Παρακράτηση', p: 'Κατά διαφορές Πελάτη-Τεχνικού: παρακράτηση έως 30 ημέρες. Αδιαμφισβήτητα ποσά: αποδίδονται εντός 7 εργάσιμων. Η PDR Connect δεν αποφαίνεται επί της ουσίας. ODR: https://ec.europa.eu/consumers/odr/' },
        { h: '§12 Διαθεσιμότητα Πλατφόρμας', p: 'Αποσκοπεί σε υψηλή διαθεσιμότητα. Γνωστοποίηση προγραμματισμένων συντηρήσεων. Δεν ευθύνεται για βλάβες εκτός ελέγχου.' },
        { h: '§13 Διάρκεια και Καταγγελία', p: 'Αόριστη διάρκεια από εγγραφή. 14 ημέρες προειδοποίηση. Άμεση καταγγελία για: επανειλημμένες παραβάσεις, παράκαμψη πληρωμών, πλαστά έγγραφα, απάτη.' },
        { h: '§14 Τροποποιήσεις', p: 'Ουσιαστικές αλλαγές: 30 ημέρες γνωστοποίηση + δικαίωμα καταγγελίας. Η συνέχιση = αποδοχή. Μη ουσιαστικές: χωρίς προειδοποίηση.' },
        { h: '§15 Εφαρμοστέο Δίκαιο & Δικαιοδοσία', p: 'Δίκαιο Κύπρου. Αποκλειστική δικαιοδοσία: Λευκωσία, εκτός υποχρεωτικών ευρωπαϊκών/εθνικών διατάξεων. ODR: https://ec.europa.eu/consumers/odr/' },
        { h: '§16 Διατηρητέα Ισχύς', p: 'Άκυρες ή ανεκτέλεστες διατάξεις αντικαθίστανται από έγκυρες που εξυπηρετούν τον ίδιο οικονομικό σκοπό. Οι υπόλοιπες διατάξεις παραμένουν σε ισχύ.' },
      ],
    },
  },

  /* ═══════════════════════════════════════════════════════════
     SPANISH  (ES)
  ═══════════════════════════════════════════════════════════ */
  es: {
    pageTitle: 'Contratos de Plataforma',
    pageSubtitle: 'Dos versiones — para Clientes y para Técnicos/Trabajadores',
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
        { h: '§1 Objeto', p: 'PDR Connect actúa exclusivamente como intermediario de colocación de profesionales. PDR Connect no se convierte en parte del contrato celebrado entre el Cliente y el Técnico.' },
        { h: '§2 Servicios', list: ['Identificación de técnicos verificados', 'Verificación de credenciales y documentos', 'Comunicación segura a través de la plataforma', 'Emisión de facturas y gestión de pagos', 'Asistencia continua'] },
        { h: '§3 Tarifa — Cliente (Gratuito)', p: 'Sin tarifa de plataforma durante el lanzamiento. Los cambios futuros se notifican con 30 días de antelación con derecho a rescisión.' },
        { h: '§4 Condiciones de Pago', p: 'En caso de elusión de pagos, PDR Connect podrá retener pagos sólo en la medida necesaria para la investigación. Los importes no controvertidos se liberan de inmediato. Intereses de demora según Directiva UE 2011/7/UE.' },
        { h: '§5 Obligaciones del Cliente', list: ['Requisitos precisos', 'Entorno seguro', 'Cumplimiento normativa laboral', 'Respetar condiciones acordadas', 'Comunicación sólo vía plataforma', 'Sin relaciones directas con técnicos'] },
        { h: '§6 Verificación', p: 'PDR Connect verifica identidad pero no garantiza resultados. El Cliente evalúa la idoneidad.' },
        { h: '§7 Protección de Datos & RGPD', p: 'Tratamiento según Reglamento (UE) 2016/679 (RGPD). Derechos: acceso, rectificación, supresión, portabilidad, oposición. Contacto: datenschutz@cybratech-solutions.com' },
        { h: '§8 Confidencialidad', p: 'Confidencialidad de todos los términos comerciales durante 3 años tras la finalización.' },
        { h: '§9 Responsabilidad', p: 'Responsabilidad ilimitada por dolo, negligencia grave y daños personales. Por negligencia leve: sólo por incumplimiento de obligaciones esenciales, limitada a daños previsibles. Se excluye lucro cesante y daños indirectos.' },
        { h: '§10 Resolución de Disputas', p: 'PDR Connect puede retener pagos durante disputas sin pronunciarse sobre el fondo. Plataforma ODR: https://ec.europa.eu/consumers/odr/' },
        { h: '§11 Disponibilidad', p: 'Se esfuerza por alta disponibilidad sin garantizarla. Sin responsabilidad por fallos fuera de su control.' },
        { h: '§12 Vigencia y Rescisión', p: 'Vigencia indefinida. Rescisión con 14 días. Rescisión inmediata por causa grave.' },
        { h: '§13 Modificaciones', p: 'Cambios materiales notificados 30 días antes con derecho a rescisión. El uso continuado implica aceptación.' },
        { h: '§14 Ley Aplicable', p: 'Derecho chipriota. Jurisdicción: Nicosia, salvo normas imperativas de consumidor UE. ODR disponible.' },
        { h: '§15 Cláusula Salvatoria', p: 'Si alguna cláusula es inválida, las demás permanecen vigentes. Se reemplaza por una cláusula válida de igual propósito.' },
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
      intro: 'Este Acuerdo de Colocación y Servicios rige la relación jurídica entre PDR Connect y el Técnico. Al registrarse en la plataforma PDR Connect, el Técnico acepta este Acuerdo con carácter legalmente vinculante.',
      sections: [
        { h: '§1 Objeto', p: 'PDR Connect actúa exclusivamente como intermediario para conectar técnicos con empresas clientes a través de pdrconnect.eu. No se convierte en parte del contrato entre Técnico y Cliente.' },
        { h: '§2 Servicios PDR Connect', list: ['Promoción activa del perfil', 'Comunicación segura con clientes', 'Facturación y gestión de pagos', 'Transferencia de honorarios tras pago verificado', 'Asistencia durante todo el proceso'] },
        { h: '§3 Tarifa de Plataforma', p: '10% del valor neto acordado. Ejemplo: 1.000€ → 100€ PDR Connect, 900€ Técnico. Cambios con 30 días de antelación y derecho a rescisión.' },
        { h: '§4 Condiciones de Pago', p: 'Pago en 7 días hábiles tras recepción verificada. Factura sólo tras notificación oficial. Elusión = incumplimiento grave. Retención sólo en medida necesaria para investigación — importes no controvertidos se liberan de inmediato.' },
        { h: '§5 Obligaciones del Técnico', list: ['Perfil completo y veraz', 'Documentos actualizados (DNI, A1, certificados)', 'Cumplir asignaciones aceptadas', 'Comunicación sólo vía plataforma', 'Notificar incumplimiento inmediatamente', 'Conducta profesional'] },
        { h: '§6 Estándares Profesionales', p: 'Garantía de perfil veraz. Trabajo conforme a estándares del sector. Suspensión/eliminación por mala conducta, documentos falsos o infracciones reiteradas.' },
        { h: '§7 Contratista Independiente', p: 'No se crea relación laboral. El Técnico es responsable de: impuestos, cotizaciones, seguros, normativa laboral/migratoria. PDR Connect no proporciona beneficios laborales.' },
        { h: '§8 Protección de Datos & RGPD', p: 'Tratamiento según Reglamento (UE) 2016/679 (RGPD). Derechos: acceso (Art. 15), rectificación (Art. 16), supresión (Art. 17), limitación (Art. 18), portabilidad (Art. 20), oposición (Art. 21). Contacto: datenschutz@cybratech-solutions.com' },
        { h: '§9 Confidencialidad', p: 'Confidencialidad de información de clientes durante 3 años tras finalización. Obligación mutua.' },
        { h: '§10 Responsabilidad', p: 'Ilimitada por dolo, negligencia grave y daños personales. Por negligencia leve: sólo obligaciones esenciales, limitada a daños previsibles. Se excluye: fallo de pago de clientes, disputas de calidad, lucro cesante.' },
        { h: '§11 Resolución de Disputas & Retención', p: 'Retención hasta 30 días en disputas. Importes no controvertidos en 7 días hábiles. PDR Connect no decide sobre el fondo. ODR: https://ec.europa.eu/consumers/odr/' },
        { h: '§12 Disponibilidad', p: 'Alta disponibilidad sin garantía de continuidad. Sin responsabilidad por fallos fuera de control.' },
        { h: '§13 Vigencia y Rescisión', p: 'Indefinida desde el registro. Rescisión con 14 días. Rescisión inmediata por: incumplimiento reiterado, elusión de pagos, documentos falsos, fraude.' },
        { h: '§14 Modificaciones', p: 'Cambios materiales: 30 días + derecho a rescisión. Uso continuado = aceptación. Cambios no materiales: sin preaviso.' },
        { h: '§15 Ley Aplicable & Jurisdicción', p: 'Derecho chipriota. Jurisdicción: Nicosia, salvo disposiciones imperativas de protección UE. ODR: https://ec.europa.eu/consumers/odr/' },
        { h: '§16 Cláusula Salvatoria', p: 'Las disposiciones inválidas se reemplazan por disposiciones válidas de igual propósito económico. Las demás disposiciones permanecen en vigor.' },
      ],
    },
  },
};

export default CONTRACTS;
