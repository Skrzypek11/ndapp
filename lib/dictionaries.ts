export type Dictionary = typeof import("@/lib/dictionaries").en;

export const en = {
    common: {
        loading: "Loading...",
        save: "Save Changes",
        cancel: "Cancel",
        actions: "Actions",
        confirm: "Confirm",
    },
    auth: {
        title: "Narcotic Division",
        subtitle: "Law Enforcement MDT",
        secure_login: "Officer Authentication",
        email: "Email Address",
        password: "Password",
        placeholder_email: "officer@lspd.gov",
        placeholder_password: "••••••••••••",
        login_btn: "Login",
        verifying: "Verifying...",
        error_auth: "Authentication failed. Check credentials.",
        error_system: "System error occurred.",
        warning_title: "Authorized Personnel Only",
        warning_text: "Access to this system is logged and monitored. Unauthorized access is a federal offense.",
        footer_location: "Mission Row Headquarters",
        footer_time: "System Time"
    },
    sidebar: {
        dashboard: "Dashboard",
        roster: "Unit Roster",
        reports: "Field Reports",
        cases: "Cases",
        settings: "Settings",
        admin: "Administration",
        users: "User Management",
        templates: "Templates",
        announcements: "Announcements",
        kompendium: "Kompendium",
        logout: "Sign Out",
        user_loading: "Authenticating...",
        operations: "Operations",
        system: "System"
    },
    settings: {
        title: "System Configuration",
        account: {
            title: "Account Settings",
            profile_header: "Agent Profile",
            rp_name: "RP Name",
            badge: "Badge Number",
            rank: "Rank",
            email: "System Login",
            change_password_header: "Security Update",
            current_password: "Current Password",
            new_password: "New Password",
            confirm_password: "Confirm New Password",
            update_password: "Update Credentials"
        },
        appearance: {
            title: "Interface Customization",
            theme_label: "Terminal Theme",
            light: "Light Mode",
            dark: "Dark Mode",
            system: "System Default"
        },
        language: {
            title: "Localization",
            select_language: "Interface Language",
            english: "English (US)",
            polish: "Polish (PL)"
        }
    },
    profile: {
        title: "Officer Profile",
        edit: "Edit Profile",
        save: "Save Changes",
        cancel: "Cancel",
        view_reports: "View Related Reports",
        view_cases: "View Related Cases",
        fields: {
            full_name: "Full Name",
            first_name: "First Name",
            last_name: "Last Name",
            badge: "Badge Number",
            rank: "Rank",
            unit: "Unit Assignment",
            status: "Duty Status",
            phone: "Contact Phone",
            email: "Contact Email",
            joined: "Date Joined",
            last_active: "Last Active",
            notes: "Additional Notes",
            certifications: "Certifications"
        },
        stats: {
            reports_authored: "Reports Authored",
            reports_coauthored: "Reports Co-Authored",
            active_cases: "Active Cases",
            closed_cases: "Closed Cases"
        },
        status: {
            active: "Active",
            leave: "On Leave",
            rest: "Rest",
            suspended: "Suspended"
        }
    },
    reports: {
        title: "Field Reports",
        create_new: "Create New Report",
        template_label: "Report Template",
        templates: {
            none: "Select a template...",
            surveillance: "Surveillance Log",
            arrest: "Arrest Report",
            seizure: "Seizure Protocol",
            incident: "Incident Report"
        },
        co_authors: "Co-Authors",
        evidence: {
            title: "Evidence & Attachments",
            add_photo: "Add Photo",
            add_video: "Add Video Link",
            photo_caption: "Caption",
            video_url: "Video URL"
        },
        table: {
            report_number: "Case Number",
            title: "Report Title",
            author: "Reporting Officer",
            date: "Submission Date",
            status: "Report Status",
            actions: "Filing Actions"
        },
        status: {
            draft: "DRAFT",
            submitted: "SUBMITTED",
            under_review: "UNDER REVIEW",
            approved: "APPROVED",
            revisions: "REVISION REQ."
        },
        form: {
            title: "Field Report Dossier",
            subtitle: "New Field Report Entry",
            edit_subtitle: "Modify Field Report Dossier",
            back: "Back",
            placeholder_title: "ENTER OPERATION CODENAME / REPORT TITLE",
            draft_id: "DRAFT ID",
            pending: "PENDING",
            officer: "OFFICER",
            save_draft: "Save Draft",
            submit: "Submit Report",
            personnel: "Involved Personnel",
            reporting_officer: "Reporting Officer",
            co_authors: "Co-Authors / Witnesses",
            narrative: "Incident Narrative",
            narrative_placeholder: "Incident details...",
            map_title: "Tactical Operations Map",
            map_hint: "Click map to deploy intel markers.",
            scene_map: "Tactical Map",
            evidence: "Evidence Locker"
        },
        list: {
            title: "Field Reports Dashboard",
            create: "Create New Report",
            create_first: "Create First Report",
            no_reports: "No reports filed yet",
            retrieving: "Retrieving Records...",
            pagination: {
                showing: "Showing",
                of: "of",
                records: "Records"
            },
            export_pdf: "Export PDF",
            export_tooltip: "Export official PDF copy",
            export_disabled_tooltip: "PDF export available only for approved reports",
            view: "View"
        },
        view: {
            title: "Report View",
            subtitle: "Operational Intelligence Node",
            back: "Back",
            edit: "Edit Report",
            review: "Review Panel",
            exporting: "Generating...",
            export: "Export PDF",
            metadata: {
                case_number: "Case Number",
                reporting_officer: "Reporting Officer",
                submission_date: "Submission Date",
                status: "Status",
                not_submitted: "NOT SUBMITTED"
            },
            narrative: "Detailed Narrative",
            evidence_locker: "Intelligence Locker",
            photos: "Photographic Assets",
            videos: "Video Assets",
            timestamp: "Timestamp",
            source: "Source",
            registry: "Intelligence Asset Registry"
        },
        review_panel: {
            title: "Review Decision Panel",
            approve: {
                title: "Approve Report",
                description: "Finalize and lock record"
            },
            reject: {
                title: "Request Revisions",
                description: "Return to officer for fixes"
            },
            comments: "Moderator Comments",
            comments_placeholder: "Provide feedback to the reporting officer...",
            confirm: "Confirm Decision",
            confirm_error: "Rejection reason is required"
        },
    },
    dashboard: {
        title: "Operational Command",
        node: "Node",
        auth: "Authorization",
        stats: {
            active_duty: "Active Duty",
            open_cases: "Open Cases",
            closed_cases: "Closed Cases",
            pending_closure: "Pending Closure"
        },
        assignments: {
            title: "Your Active Assignments",
            no_cases: "No active case assignments found",
            view_all: "View All"
        },
        recent_reports: {
            title: "Recent Intelligence Reports",
            no_reports: "No recent field reports filed",
            view_all: "View All"
        },
        announcements: {
            title: "Announcements",
            manage: "Manage",
            archive: "Bulletin Archive"
        },
        activity: {
            title: "Network Activity Log",
            monitoring: "Monitoring bandwidth..."
        },
        table: {
            status: "Status",
            updated: "Updated",
            submitted: "Submitted"
        },
        announcements_preview: {
            title: "Latest Announcements",
            view_all: "View All →"
        }
    },
    announcements: {
        title: "Announcements Terminal",
        subtitle: "Official Operational Communications",
        create: "New Announcement",
        no_announcements: "No announcements found in bulletin",
        filter: {
            all: "ALL",
            unread: "UNREAD",
            read: "READ"
        },
        status: {
            unread: "Unread",
            read: "Read"
        },
        priority: {
            normal: "Normal",
            high: "High",
            critical: "Critical"
        },
        form: {
            title: "Title",
            body: "Content",
            priority: "Priority",
            pinned: "Pin to top",
            publish: "Publish",
            save_draft: "Save Draft"
        },
        read_tracking: {
            title: "Read Receipts",
            confirmed: "Confirmed Read",
            read_by: "Read By",
            loading: "Loading readers...",
            no_reads: "No reads yet"
        },
        delete: "Delete Announcement",
        delete_confirm: "Are you sure you want to delete this announcement?"
    },
    kompendium: {
        title: "Division Kompendium",
        subtitle: "Knowledge Base & Operational Protocols",
        no_docs: "No documents found in registry",
        search: "Search protocols...",
        toc: "Table of Contents",
        author: "Author",
        date: "Date",
        tags: "Tags"
    },
    roster: {
        title: "Division Roster",
        subtitle: "Internal personnel index and real-time operational status log. Restricted access node.",
        search_placeholder: "SEARCH BY NAME OR BADGE...",
        status_filter: "Status Filter",
        all_personnel: "All Personnel",
        status_types: {
            active: "Operational / Active",
            standby: "Standby",
            leave: "On Leave",
            suspended: "Suspended",
            all: "All Personnel"
        },
        table: {
            avatar: "Avatar",
            name: "Name",
            badge: "Badge",
            rank: "Rank",
            contact: "Contact",
            status: "Status"
        },
        no_results: "No personnel matching criteria found in logs",
        entries_info: "Showing {count} of {total} Database entries"
    },
    cases: {
        list: {
            title: "Case Management System",
            create: "Open New Case",
            create_first: "Open First Case",
            no_cases: "No active cases found",
            no_cases_desc: "Initiate a new operational folder to begin tracking assets and evidence.",
            retrieving: "Retrieving Dossiers...",
            view: "View",
            pagination: {
                showing: "Showing",
                of: "of",
                records: "Records"
            }
        },
        table: {
            case_id: "Case ID",
            title: "Title",
            investigator: "Lead Investigator",
            submitted: "Submitted",
            status: "Status",
            actions: "Actions"
        },
        status: {
            active: "ACTIVE",
            closed: "CLOSED",
            pending: "PENDING",
            under_investigation: "IN PROGRESS"
        },
        view: {
            title: "Dossier View",
            subtitle: "Operational Case Dossier",
            back: "Back",
            edit: "Edit Dossier",
            submit: "Submit Case",
            review: "Administrative Review",
            complete: "Mark as Completed",
            return: "Return for Revisions",
            close: "Approve & Close Case",
            metadata: {
                case_id: "Case ID",
                lead_investigator: "Lead Investigator",
                reporting_officer: "Reporting Officer",
                initialization_date: "Initialization Date"
            },
            context: "Case Context & Objectives",
            context_placeholder: "No context provided for this investigation.",
            field_reports: "Associated Field Reports",
            no_reports: "No reports linked to this investigation",
            open_report: "Open Report",
            context_note: "Investigator's Context Note",
            personnel: "Case Personnel",
            lead: "Lead Investigator",
            participants: "Assigned Participants",
            agent: "Agent",
            timeline: "Dossier Status Timeline",
            initialized: "Initialized",
            submitted: "Submitted for Review",
            approved: "Approved & Sealed"
        },
        review: {
            title: "Administrative Review Protocol",
            node: "Node Status",
            reviewer: "Reviewer",
            assign_lead: "Assign Lead Investigator",
            select_agent: "Select Agent...",
            authorize: "Authorize & Assign",
            return: "Return for Revisions",
            alert_valid_lead: "Please select a valid Lead Investigator",
            access_denied: "Access Denied",
            unauthorized: "Unauthorized Badge level for this secure node.",
            accessing: "Accessing Case Dossier..."
        },
        form: {
            title: "Investigation Dossier",
            subtitle: "Initialize New Case",
            edit_subtitle: "Update Case File",
            back: "Back to List",
            header: "Initialize New Case",
            edit_header: "Edit Case Dossier",
            network: "Internal Intelligence Network - Central Bureau",
            fields: {
                title: "Operation Codename",
                lead: "Lead Investigator",
                participants: "Assigned Participants",
                context: "Case Context & Objectives"
            },
            placeholders: {
                title: "e.g. Operation Blue Moon",
                context: "Provide detailed objectives and known facts..."
            },
            buttons: {
                create: "Authorize Case",
                update: "Seal Changes"
            }
        }
    },
    admin: {
        users: {
            title: "Personnel Management",
            add_agent: "Add Agent",
            cancel: "Cancel",
            fields: {
                rp_name: "RP Name",
                email: "Email (Login)",
                password: "Password",
                badge: "Badge Number",
                phone: "Phone Number",
                rank: "Rank"
            },
            placeholders: {
                rp_name: "e.g. John Doe",
                email: "agent@narcotic.div",
                password: "••••••",
                badge: "e.g. 101",
                phone: "e.g. 555-1234"
            },
            submit: "Create Personnel File",
            processing: "Processing...",
            table: {
                agent: "Agent",
                badge: "Badge",
                rank: "Rank",
                role: "System Role",
                contact: "Contact"
            }
        },
        templates: {
            title: "Template Manager",
            subtitle: "System Configuration :: Templates",
            create: "Create Template",
            edit: "Edit Template",
            name: "Template Name",
            name_placeholder: "e.g. Arrest Report",
            context: "Target Context",
            description: "Description",
            desc_placeholder: "Brief description...",
            content: "Template Content",
            insert: "Insert Template",
            save: "Save Template",
            cancel: "Cancel",
            delete_confirm: "Are you sure you want to delete this template?",
            no_templates: "No templates defined",
            last_updated: "Last Updated",
            warning: "Warning: Inserting a template will overwrite current content."
        }
    }
}

export const pl = {
    common: {
        loading: "Ładowanie...",
        save: "Zapisz Zmiany",
        cancel: "Anuluj",
        actions: "Akcje",
        confirm: "Potwierdź",
    },
    auth: {
        title: "Wydział Narkotykowy",
        subtitle: "MDT Służb Mundurowych",
        secure_login: "Autoryzacja Funkcjonariusza",
        email: "Adres E-mail",
        password: "Hasło",
        placeholder_email: "funkcjonariusz@lspd.gov",
        placeholder_password: "••••••••••••",
        login_btn: "Zaloguj Się",
        verifying: "Weryfikacja...",
        error_auth: "Błąd autoryzacji. Sprawdź dane.",
        error_system: "Wystąpił błąd systemu.",
        warning_title: "Tylko dla Upoważnionych",
        warning_text: "Użycie systemu jest rejestrowane. Nieautoryzowany dostęp jest przestępstwem federalnym.",
        footer_location: "Kwatera Główna Mission Row",
        footer_time: "Czas Systemowy"
    },
    sidebar: {
        dashboard: "Panel Główny",
        roster: "Lista Jednostki",
        reports: "Raporty Terenowe",
        cases: "Sprawy",
        settings: "Ustawienia",
        admin: "Administracja",
        users: "Zarządzanie Użytkownikami",
        templates: "Szablony",
        announcements: "Ogłoszenia",
        kompendium: "Kompendium",
        logout: "Wyloguj",
        user_loading: "Autoryzacja...",
        operations: "Operacje",
        system: "System"
    },
    settings: {
        title: "Konfiguracja Systemu",
        account: {
            title: "Ustawienia Konta",
            profile_header: "Profil Agenta",
            rp_name: "Imię i Nazwisko (RP)",
            badge: "Numer Odznaki",
            rank: "Stopień",
            email: "Login Systemowy",
            change_password_header: "Aktualizacja Zabezpieczeń",
            current_password: "Obecne Hasło",
            new_password: "Nowe Hasło",
            confirm_password: "Potwierdź Nowe Hasło",
            update_password: "Zaktualizuj Poświadczenia"
        },
        appearance: {
            title: "Personalizacja Interfejsu",
            theme_label: "Motyw Terminala",
            light: "Tryb Jasny",
            dark: "Tryb Ciemny",
            system: "Domyślny Systemowy"
        },
        language: {
            title: "Lokalizacja",
            select_language: "Język Interfejsu",
            english: "Angielski (US)",
            polish: "Polski (PL)"
        }
    },
    profile: {
        title: "Profil Funkcjonariusza",
        edit: "Edytuj Profil",
        save: "Zapisz Zmiany",
        cancel: "Anuluj",
        view_reports: "Zobacz Powiązane Raporty",
        view_cases: "Zobacz Powiązane Sprawy",
        fields: {
            full_name: "Imię i Nazwisko",
            first_name: "Imię",
            last_name: "Nazwisko",
            badge: "Numer Odznaki",
            rank: "Stopień",
            unit: "Przydział Jednostki",
            status: "Status Służbowy",
            phone: "Telefon Kontaktowy",
            email: "Email Kontaktowy",
            joined: "Data Dołączenia",
            last_active: "Ostatnia Aktywność",
            notes: "Dodatkowe Notatki",
            certifications: "Certyfikaty"
        },
        stats: {
            reports_authored: "Autor Raportów",
            reports_coauthored: "Współautor Raportów",
            active_cases: "Aktywne Sprawy",
            closed_cases: "Zamknięte Sprawy"
        },
        status: {
            active: "Aktywny",
            leave: "Na Urlopie",
            rest: "Odpoczynek",
            suspended: "Zawieszony"
        }
    },
    reports: {
        title: "Raporty Terenowe",
        create_new: "Utwórz Nowy Raport",
        template_label: "Szablon Raportu",
        templates: {
            none: "Wybierz szablon...",
            surveillance: "Dziennik Obserwacji",
            arrest: "Raport z Aresztowania",
            seizure: "Protokół Zajęcia Mienia",
            incident: "Raport z Incydentu"
        },
        co_authors: "Współautorzy",
        evidence: {
            title: "Dowody i Załączniki",
            add_photo: "Dodaj Zdjęcie",
            add_video: "Dodaj Link Wideo",
            photo_caption: "Opis",
            video_url: "Adres URL Wideo"
        },
        table: {
            report_number: "Numer Sprawy",
            title: "Tytuł Raportu",
            author: "Funkcjonariusz",
            date: "Data Przesłania",
            status: "Status Raportu",
            actions: "Akcje Składowania"
        },
        status: {
            draft: "SZKIC",
            submitted: "WYSŁANY",
            under_review: "WERYFIKACJA",
            approved: "ZATWIERDZONY",
            revisions: "WYMAGA POPRAWY"
        },
        form: {
            title: "Akta Raportu Terenowego",
            subtitle: "Nowy Wpis Raportu Terenowego",
            edit_subtitle: "Modyfikuj Akta Raportu Terenowego",
            back: "Powrót",
            placeholder_title: "WPROWADŹ KRYPTONIM OPERACJI / TYTUŁ RAPORTU",
            draft_id: "ID SZKICU",
            pending: "OCZEKUJĄCY",
            officer: "FUNKCJONARIUSZ",
            save_draft: "Zapisz Szkic",
            submit: "Prześlij Raport",
            personnel: "Zaangażowany Personel",
            reporting_officer: "Funkcjonariusz Sprawozdawczy",
            co_authors: "Współautorzy / Świadkowie",
            narrative: "Narracja Zdarzenia",
            narrative_placeholder: "Szczegóły incydentu...",
            map_title: "Mapa Taktyczno-Operacyjna",
            map_hint: "Kliknij mapę, aby rozmieścić znaczniki wywiadowcze.",
            scene_map: "Mapa Taktyczna",
            evidence: "Szafka Dowodowa"
        },
        list: {
            title: "Dashboard Raportów Terenowych",
            create: "Utwórz Nowy Raport",
            create_first: "Utwórz Pierwszy Raport",
            no_reports: "Brak złożonych raportów",
            retrieving: "Pobieranie Rekordów...",
            export_pdf: "Eksportuj PDF",
            export_tooltip: "Eksportuj oficjalną kopię PDF",
            export_disabled_tooltip: "Eksport PDF dostępny tylko dla zatwierdzonych raportów",
            view: "Widok",
            pagination: {
                showing: "Pokazywanie",
                of: "z",
                records: "Rekordów"
            }
        },
        view: {
            title: "Widok Raportu",
            subtitle: "Węzeł Inteligencji Operacyjnej",
            back: "Powrót",
            edit: "Edytuj Raport",
            review: "Panel Recenzji",
            exporting: "Generowanie...",
            export: "Eksportuj PDF",
            metadata: {
                case_number: "Numer Sprawy",
                reporting_officer: "Funkcjonariusz Sprawozdawczy",
                submission_date: "Data Przesłania",
                status: "Status",
                not_submitted: "NIE PRZESŁANO"
            },
            narrative: "Szczegółowa Narracja",
            evidence_locker: "Szafka Dowodowa",
            photos: "Zasoby Fotograficzne",
            videos: "Zasoby Wideo",
            timestamp: "Sygnatura Czasowa",
            source: "Źródło",
            registry: "Rejestr Aktywów Wywiadowczych"
        },
        review_panel: {
            title: "Panel Decyzji Recenzji",
            approve: {
                title: "Zatwierdź Raport",
                description: "Sfinalizuj i zablokuj rekord"
            },
            reject: {
                title: "Zażądaj Poprawek",
                description: "Zwróć do funkcjonariusza w celu naprawy"
            },
            comments: "Komentarze Moderatora",
            comments_placeholder: "Przekaż opinię funkcjonariuszowi sprawozdawczemu...",
            confirm: "Potwierdź Decyzję",
            confirm_error: "Powód odrzucenia jest wymagany"
        },
    },
    dashboard: {
        title: "Dowodzenie Operacyjne",
        node: "Węzeł",
        auth: "Autoryzacja",
        stats: {
            active_duty: "W Służbie",
            open_cases: "Otwarte Sprawy",
            closed_cases: "Zamknięte Sprawy",
            pending_closure: "Oczekuje na Zamknięcie"
        },
        assignments: {
            title: "Twoje Aktywne Zadania",
            no_cases: "Brak aktywnych przypisanych spraw",
            view_all: "Pokaż Wszystkie"
        },
        recent_reports: {
            title: "Ostatnie Raporty Wywiadowcze",
            no_reports: "Brak ostatnio złożonych raportów",
            view_all: "Pokaż Wszystkie"
        },
        announcements: {
            title: "Ogłoszenia",
            manage: "Zarządzaj",
            archive: "Archiwum Biuletynu"
        },
        activity: {
            title: "Log Aktywności Sieci",
            monitoring: "Monitorowanie pasma..."
        },
        table: {
            status: "Status",
            updated: "Zaktualizowano",
            submitted: "Wysłano"
        },
        announcements_preview: {
            title: "Ostatnie Ogłoszenia",
            view_all: "Zobacz wszystkie →"
        }
    },
    announcements: {
        title: "Terminal Ogłoszeń",
        subtitle: "Oficjalne Komunikaty Operacyjne",
        create: "Nowe ogłoszenie",
        no_announcements: "Nie znaleziono ogłoszeń w biuletynie",
        filter: {
            all: "WSZYSTKIE",
            unread: "NIEPRZECZYTANE",
            read: "PRZECZYTANE"
        },
        status: {
            unread: "Nieprzeczytane",
            read: "Przeczytane"
        },
        priority: {
            normal: "Normalny",
            high: "Wysoki",
            critical: "Krytyczny"
        },
        form: {
            title: "Tytuł",
            body: "Treść",
            priority: "Priorytet",
            pinned: "Przypnij na górze",
            publish: "Publikuj",
            save_draft: "Zapisz jako szkic"
        },
        read_tracking: {
            title: "Potwierdzenia odczytania",
            confirmed: "Potwierdzono odczyt",
            read_by: "Przeczytane przez",
            loading: "Ładowanie listy...",
            no_reads: "Brak odczytów"
        },
        delete: "Usuń Ogłoszenie",
        delete_confirm: "Czy na pewno chcesz usunąć to ogłoszenie?"
    },
    kompendium: {
        title: "Kompendium Jednostki",
        subtitle: "Baza Wiedzy i Protokoły Operacyjne",
        no_docs: "Nie znaleziono dokumentów w rejestrze",
        search: "Szukaj protokołów...",
        toc: "Spis Treści",
        author: "Autor",
        date: "Data",
        tags: "Tagi"
    },
    roster: {
        title: "Lista Jednostki",
        subtitle: "Indeks personelu wewnętrznego i log statusu operacyjnego w czasie rzeczywistym. Węzeł o ograniczonym dostępie.",
        search_placeholder: "SZUKAJ PO IMIENIU LUB ODZNAKI...",
        status_filter: "Filtr Statusu",
        all_personnel: "Wszyscy Funkcjonariusze",
        status_types: {
            active: "Operacyjny / Aktywny",
            standby: "W Gotowości",
            leave: "Na Urlopie",
            suspended: "Zawieszony",
            all: "Wszyscy Funkcjonariusze"
        },
        table: {
            avatar: "Awatar",
            name: "Imię i Nazwisko",
            badge: "Odznaka",
            rank: "Stopień",
            contact: "Kontakt",
            status: "Status"
        },
        no_results: "Nie znaleziono personelu spełniającego kryteria w logach",
        entries_info: "Pokazywanie {count} z {total} wpisów w Bazie"
    },
    cases: {
        list: {
            title: "System Zarządzania Sprawami",
            create: "Otwórz Nową Sprawę",
            create_first: "Otwórz Pierwszą Sprawę",
            no_cases: "Brak aktywnych spraw",
            no_cases_desc: "Zainicjuj nowy folder operacyjny, aby rozpocząć śledzenie zasobów i dowodów.",
            retrieving: "Pobieranie Akt...",
            view: "Podgląd",
            pagination: {
                showing: "Pokazywanie",
                of: "z",
                records: "Rekordów"
            }
        },
        table: {
            case_id: "ID Sprawy",
            title: "Tytuł",
            investigator: "Główny Śledczy",
            submitted: "Przesłano",
            status: "Status",
            actions: "Akcje"
        },
        status: {
            active: "AKTYWNA",
            closed: "ZAMKNIĘTA",
            pending: "OCZEKUJĄCA",
            under_investigation: "W TOKU"
        },
        view: {
            title: "Widok Akt",
            subtitle: "Operacyjne Akta Sprawy",
            back: "Powrót",
            edit: "Edytuj Akta",
            submit: "Prześlij Sprawę",
            review: "Przegląd Administracyjny",
            complete: "Oznacz jako Zakończone",
            return: "Zwróć do Poprawek",
            close: "Zatwierdź i Zamknij Sprawę",
            metadata: {
                case_id: "ID Sprawy",
                lead_investigator: "Główny Śledczy",
                reporting_officer: "Funkcjonariusz Sprawozdawczy",
                initialization_date: "Data Inicjalizacji"
            },
            context: "Kontekst i Cele Sprawy",
            context_placeholder: "Brak kontekstu dla tego dochodzenia.",
            field_reports: "Powiązane Raporty Terenowe",
            no_reports: "Brak raportów powiązanych z tym dochodzeniem",
            open_report: "Otwórz Raport",
            context_note: "Notatka Kontekstowa Śledczego",
            personnel: "Personel Sprawy",
            lead: "Główny Śledczy",
            participants: "Przydzieleni Uczestnicy",
            agent: "Agent",
            timeline: "Oś Czasu Statusu Akt",
            initialized: "Zainicjowano",
            submitted: "Przesłano do Recenzji",
            approved: "Zatwierdzono i Zapieczętowano"
        },
        review: {
            title: "Protokół Przeglądu Administracyjnego",
            node: "Status Węzła",
            reviewer: "Recenzent",
            assign_lead: "Przydziel Głównego Śledczego",
            select_agent: "Wybierz Agenta...",
            authorize: "Autoryzuj i Przydziel",
            return: "Zwróć do Poprawek",
            alert_valid_lead: "Proszę wybrać poprawnego Głównego Śledczego",
            access_denied: "Odmowa Dostępu",
            unauthorized: "Nieautoryzowany poziom odznaki dla tego bezpiecznego węzła.",
            accessing: "Dostęp do Akt Sprawy..."
        },
        form: {
            title: "Akta Dochodzeniowe",
            subtitle: "Zainicjuj Nową Sprawę",
            edit_subtitle: "Zaktualizuj Plik Sprawy",
            back: "Powrót do Listy",
            header: "Zainicjuj Nową Sprawę",
            edit_header: "Edytuj Akta Sprawy",
            network: "Wewnętrzna Sieć Wywiadowcza - Biuro Centralne",
            fields: {
                title: "Kryptonim Operacji",
                lead: "Główny Śledczy",
                participants: "Przydzieleni Uczestnicy",
                context: "Kontekst i Cele Sprawy"
            },
            placeholders: {
                title: "np. Operacja Błękitny Księżyc",
                context: "Podaj szczegółowe cele i znane fakty..."
            },
            buttons: {
                create: "Autoryzuj Sprawę",
                update: "Zapieczętuj Zmiany"
            }
        }
    },
    admin: {
        users: {
            title: "Zarządzanie Personelem",
            add_agent: "Dodaj Agenta",
            cancel: "Anuluj",
            fields: {
                rp_name: "Imię i Nazwisko (RP)",
                email: "Email (Login)",
                password: "Hasło",
                badge: "Numer Odznaki",
                phone: "Numer Telefonu",
                rank: "Stopień"
            },
            placeholders: {
                rp_name: "np. Jan Kowalski",
                email: "agent@narcotic.div",
                password: "••••••",
                badge: "np. 101",
                phone: "np. 555-1234"
            },
            submit: "Utwórz Akta Personelu",
            processing: "Przetwarzanie...",
            table: {
                agent: "Agent",
                badge: "Odznaka",
                rank: "Stopień",
                role: "Rola Systemowa",
                contact: "Kontakt"
            }
        },
        templates: {
            title: "Zarządzanie Szablonami",
            subtitle: "Konfiguracja Systemu :: Szablony",
            create: "Utwórz Szablon",
            edit: "Edytuj Szablon",
            name: "Nazwa Szablonu",
            name_placeholder: "np. Raport z Aresztowania",
            context: "Kontekst Docelowy",
            description: "Opis",
            desc_placeholder: "Krótki opis...",
            content: "Treść Szablonu",
            insert: "Wstaw Szablon",
            save: "Zapisz Szablon",
            cancel: "Anuluj",
            delete_confirm: "Czy na pewno chcesz usunąć ten szablon?",
            no_templates: "Brak zdefiniowanych szablonów",
            last_updated: "Ostatnia Aktualizacja",
            warning: "Uwaga: Wstawienie szablonu nadpisze obecną treść."
        }
    }
}
