/* =========================================================
   News & breaking news
   Edit this file to post announcements. Every text is given
   once per language (en / id / de); if a language is missing,
   the English text is shown.
   ========================================================= */

window.NEWS = {

  /* Breaking news: shown as a pop-up when the page opens, and pinned
     at the top of the News section. Use it for short-notice changes,
     e.g. a different service time this Sunday.
     - Set "active" to true to show it, false to hide it.
     - Give every new notice a new "id": visitors who closed the
       previous notice will then see the new one. */
  breaking: {
    active: false,
    id: "example-notice",
    title: {
      en: "Change of service time",
      id: "Perubahan jam ibadah",
      de: "Geänderte Gottesdienstzeit"
    },
    text: {
      en: "This Sunday the service starts at 11:00 instead of 10:30.",
      id: "Minggu ini ibadah dimulai pukul 11:00, bukan 10:30.",
      de: "An diesem Sonntag beginnt der Gottesdienst um 11:00 statt um 10:30 Uhr."
    }
  },

  /* Announcements, newest first. Date format: YYYY-MM-DD.
     While this list is empty (and no breaking news is active), the whole
     News section and its menu link are hidden. To add one, put a block
     like this inside the brackets:
     {
       date: "2026-12-24",
       title: { en: "...", id: "...", de: "..." },
       text:  { en: "...", id: "...", de: "..." }
     }
     Separate several blocks with commas. */
  items: []
};
