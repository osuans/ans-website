/**
 * Content for the Nuclear Science Week featured page (/nuclear-science-week).
 *
 * Everything on that page comes from here. Leave a field empty ('' or omit it)
 * until the information is confirmed and the page shows a "coming soon"
 * placeholder instead:
 *   - registrationUrl: '' → the register button reads "Registration opening soon"
 *   - photo: omitted → the person's initials are shown
 *   - bio: omitted → no bio is shown
 * Photos go in public/uploads/nsw/ and are referenced as '/uploads/nsw/<file>'.
 */

export interface Person {
  role: string;
  name: string;
  title?: string;
  organization: string;
  photo?: string;
  bio?: string;
}

export interface AgendaItem {
  time: string;
  activity: string;
  /** Invitation-only item; shown with a "VIP only" badge. */
  vipOnly?: boolean;
}

export interface Tour {
  name: string;
  location: string;
  host: string;
  guides?: string;
}

export interface Panel {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  registrationUrl: string;
  agenda: AgendaItem[];
  /** Laboratory tour stops; omit if the event has no tours. */
  tours?: Tour[];
  toursIntro?: string;
  people: Person[];
  /** Shown under the people grid, e.g. for panelists still being confirmed. */
  peopleNote?: string;
}

export const NSW = {
  title: 'National Nuclear Science Week 2026',
  dates: 'October 19–23, 2026',
  intro:
    'National Nuclear Science Week is a nationwide celebration of nuclear science and the people who make it possible. This year, the ANS Student Section at The Ohio State University is marking the week with high school outreach and two panels that bring leaders from industry, government, and the national laboratories to campus.',

  outreach: {
    date: 'Thursday, October 15, 2026',
    description: [
      'The week before Nuclear Science Week, ANS members visit three partner high schools in central Ohio to introduce students to nuclear science: how reactors work, where nuclear technology shows up in medicine and industry, and the careers that grow out of it.',
      'We also invite teachers from each school to join us at the Ohio Nuclear Workforce Panel, connecting classrooms with the people building Ohio’s nuclear future.',
    ],
  },

  panels: [
    {
      id: 'workforce-panel',
      title: 'Ohio Nuclear Workforce Panel',
      description:
        'Hosted with the Ohio Nuclear Alliance, this panel convenes leaders from across Ohio’s nuclear sector to discuss the state’s nuclear future and the workforce behind it, with voices from industry, the skilled trades, education, and state government.',
      date: 'Tuesday, October 20, 2026',
      time: '2:30 PM – 6:00 PM (panel begins at 4:00 PM)',
      location: 'Scott Laboratory N050, The Ohio State University',
      registrationUrl: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=NlYJ61IQlUiVKx_53x0RIdCQb8jqLuRNvqUp_jnX8HVUQThBQlBYVU1CV04yNDZHSE5TWThMUjlFSC4u',
      agenda: [
        {
          time: '1:00 PM – 2:00 PM',
          activity: 'Reactor tour for invited guests, including travel from main campus',
          vipOnly: true,
        },
        {
          time: '2:30 PM – 3:30 PM',
          activity: 'Laboratory tours: three 20-minute stops, with every group rotating through all three',
        },
        { time: '3:45 PM', activity: 'Catering begins' },
        {
          time: '4:00 PM – 4:10 PM',
          activity:
            'Introductions and remarks from ANS at OSU, the Ohio Nuclear Alliance, a recorded address from the ANS President, and an invited speaker',
        },
        { time: '4:10 PM – 5:00 PM', activity: 'Moderated panel' },
        { time: '5:00 PM – 5:15 PM', activity: 'Audience Q&A' },
        { time: '5:15 PM – 6:00 PM', activity: 'Closing remarks and networking reception' },
      ],
      toursIntro:
        'Before the panel, attendees tour three of Ohio State’s nuclear research facilities. Groups spend 20 minutes at each stop and rotate through all three.',
      tours: [
        {
          name: 'Materials at Extremes (MATX)',
          location: 'Scott Laboratory W075',
          host: 'Prof. Calvin Stewart',
          guides: 'Grant, Haven, and Daniel',
        },
        {
          name: 'OSU NMR Facility',
          location: 'CBEC 092',
          host: 'Dr. Dan Conroy',
          guides: 'Ella',
        },
        {
          name: 'NuScale E2 SMR Simulator',
          location: 'Scott Laboratory W273',
          host: 'Prof. Carol Smidts',
          guides: 'Vinicius',
        },
      ],
      people: [
        { role: 'Moderator', name: 'Prof. Marat Khafizov', organization: 'The Ohio State University' },
        { role: 'Panelist', name: 'Matt Snider', organization: 'Centrus Energy' },
        { role: 'Panelist', name: 'Dr. Julie Blevins', organization: 'DCS Emerald' },
        { role: 'Panelist', name: 'Andrew Conway', organization: 'Public Utilities Commission of Ohio' },
        { role: 'Speaker', name: 'Daniel Watts', organization: 'Centrus Energy' },
        {
          role: 'Recorded Address',
          name: 'Mark Peters',
          title: 'President',
          organization: 'American Nuclear Society',
        },
      ],
      peopleNote: 'Additional panelists will be announced soon.',
    },
    {
      id: 'national-laboratory-panel',
      title: 'National Laboratory Panel',
      description:
        'Researchers from the U.S. national laboratories share their work and the paths that led them there, from graduate research to careers at the forefront of nuclear science and engineering.',
      date: '',
      time: '',
      location: '',
      registrationUrl: 'https://buckeyemailosu.sharepoint.com/:l:/s/AmericanNuclearSocietyatOSU/JABBNrxGnxlPRJWsKJuYpaJcAdffSPviVnAfouR7nwZCI5c?nav=MDg0N2JjNWQtZjdmMS00NDMwLWIwOTAtMmEwZDJkOTVlZmYw',
      agenda: [],
      people: [],
      peopleNote: 'Panelists will be announced soon.',
    },
  ] as Panel[],
};
