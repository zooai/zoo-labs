/**
 * Zoo Labs site configuration — one home for the names and links the site shows.
 */

export const config = {
  org: {
    name: 'Zoo Labs',
    // GitHub org the open-source listing reads.
    github: 'zoo-labs',
    tagline: 'Open Source',
    description:
      'Zoo Labs Foundation is a 501(c)(3) open AI research network — decentralized AI experiments, decentralized science, and community-driven research.',
  },

  links: {
    foundation: 'https://zoo.ngo',
    zips: 'https://zips.zoo.ngo',
    github: 'https://github.com/zooai',
  },

  // Header nav. Absolute so the same links work from every page.
  nav: [
    { label: 'Open Source', href: '/#open-source' },
    { label: 'Research', href: '/#research' },
    { label: 'Foundation', href: '/#foundation' },
  ],

  featuredRepos: ['zoo', 'zdk', 'sdk', 'contracts', 'foundation', 'research', 'zips', 'docs'],

  copyright: 'Zoo Labs Foundation',

  meta: {
    title: 'Zoo Labs — open AI research network',
    description:
      'Open AI research from Zoo Labs Foundation — decentralized AI, decentralized science, and Blue the beluga.',
  },
};
