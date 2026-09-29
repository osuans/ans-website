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
  /** Shown under the bio as "Research interests: …". */
  interests?: string;
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
        { role: 'Panelist', name: 'Dr. Julie Blevins', organization: 'Dublin City Schools, Emerald Campus' },
        { role: 'Panelist', name: 'Joe Dillow', organization: 'International Brotherhood of Electrical Workers (IBEW)' },
        { role: 'Panelist', name: 'Andrew Conway', organization: 'Public Utilities Commission of Ohio' },
        { role: 'Speaker', name: 'Daniel Watts', organization: 'Centrus Energy' },
        {
          role: 'Recorded Address',
          name: 'Mark Peters',
          title: 'President',
          organization: 'American Nuclear Society',
        },
      ],
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
      people: [
        {
          role: 'Panelist',
          name: 'Dr. Bronson Lynn',
          title: 'Scientist, Tritium Technology Division',
          organization: 'Savannah River National Laboratory',
          photo: '/uploads/nsw/bronson-lynn.webp',
          bio: 'Bronson Lynn is a scientist in the Tritium Technology Division at Savannah River National Laboratory. He received his Ph.D. in Chemical Engineering from Clemson University in 2024. His research focuses on hydrogen isotope separation processes for the nuclear fusion fuel cycle and tritium interactions with fusion-relevant materials.',
        },
        {
          role: 'Panelist',
          name: 'Dr. Brandon Chung',
          title: 'Group Leader, Nuclear Materials, Security, and Technology Group',
          organization: 'Lawrence Livermore National Laboratory',
          photo: '/uploads/nsw/brandon-chung.webp',
          bio: 'Brandon Chung is a Group Leader for the Nuclear Materials, Security, and Technology Group in the Materials Science Division. Concurrently, he is an Associate Program Leader (APL) for Tritium Operations in Superblock. He specializes in the metallurgy and analytical chemistry of nuclear materials and tritium operations. In his current role, he is responsible for group performance and technical direction, strategic planning, technical road-mapping, and setting the R&D direction in materials science of nuclear materials. In addition to nuclear materials, he has worked on solid-state ionics and electrochemistry of ceramic ion conductors and development of electrochemical gas sensors. He earned his Ph.D. in Materials Science and Engineering in 1996 from the University of California at Los Angeles. From 1996 to 1999, he was at AlliedSignal Aerospace in both technical and project engineering roles on fuel cell development and oxygen generator projects for Mars In-Situ Resource Utilization programs. He joined LLNL in July of 1999, at which time he worked on the solid oxide fuel cell, hydrogen electrolyzer and electrochemical gas sensor projects. Since 2001, he has worked on physical and electronic properties of actinides.',
          interests: 'Plutonium and Tritium Science, Nuclear Forensics, Solid State Chemistry and Electrochemistry, Correlated Electron Materials, Photoemission Spectroscopy and Surface Science, Fuel Cell, Electrochemical Gas Sensor, Solid State Ionics',
        },
        {
          role: 'Panelist',
          name: 'Dr. Kelly Truax',
          organization: 'Pacific Northwest National Laboratory',
          photo: '/uploads/nsw/kelly-truax.webp',
          bio: 'Kelly Truax earned her Professional Geology Degree (B.S.) from Mississippi State University in 2019 followed by a M.S. and Ph.D. in Earth and Planetary Sciences from the University of Hawai‘i at Mānoa (2020; 2023). Her research spans environmental monitoring, radiation detection, and application of ML/AI. She has experience working with images, object detection, neural network training, and statistical methods to name a few. Skills extend to field sampling (water, soil, etc.), laser induced fluorescence, actinide and gas separations/analysis, and gamma-spectroscopy. Current work at Pacific Northwest National Laboratory (PNNL) explores AI/ML transferability, automated gamma spectra analysis, and multi-modal multi-model detection capabilities to find solutions that advance the field of nuclear forensics and improve operational processes.',
        },
      ],
    },
  ] as Panel[],
};
