# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Comprehensive translations for **Photo Evidence Modal** (titles, fields, placeholders, buttons).
- New dictionary keys for **Report Management** in both English and Polish (`reports.view`, `reports.form`, `reports.photo_modal`).
- Translation for 'Confiscations' header in Create Report page.
- Translation for Admin 'Lead Assignment Protocol' in Case Form.
- Status keys `pending`, `rejected`, `under_investigation` added to `reports.status`.

### Changed
- Refactored `EvidenceManager.tsx` to use localized strings for Evidence Lockers.
- Refactored `PhotoEvidenceModal.tsx` to fully utilize `useTranslation` hook.
- Refactored `CoAuthorSelect.tsx` to use `dict.reports.form` keys.
- Updated `lib/dictionaries.ts` structure to support nested modal translations.

### Fixed
- Critical syntax errors in `lib/dictionaries.ts` (fixed nesting and missing braces).
- Resolved "redeclare block-scoped variable" errors in dictionary definitions.
- Fixed hardcoded "New Entry" button text in Evidence Manager.
