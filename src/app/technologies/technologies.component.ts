import { ChangeDetectionStrategy, Component } from '@angular/core';

interface LogoChip {
  src: string;
  label: string;
  light?: boolean;
}

interface Cluster {
  tag: string;
  title: string;
  caption: string;
  body: string;
  logos: LogoChip[];
}

@Component({
  selector: 'app-technologies',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './technologies.component.html',
  styleUrl: './technologies.component.scss'
})
export class TechnologiesComponent {
  clusters: Cluster[] = [
    {
      tag: '01 · Frontend',
      title: 'What your customers see',
      caption: 'Fast, accessible interfaces that work on a five-year-old phone in a metro tunnel.',
      body: '',
      logos: [
        { src: 'logos/react.svg',       label: 'React' },
        { src: 'logos/angular.svg',     label: 'Angular',    light: true },
        { src: 'logos/nextjs.svg',      label: 'Next.js',    light: true },
        { src: 'logos/typescript.svg',  label: 'TypeScript' },
        { src: 'logos/tailwindcss.svg', label: 'Tailwind' },
        { src: 'logos/vuejs.svg',       label: 'Vue' }
      ]
    },
    {
      tag: '02 · Backend',
      title: 'The engine that runs it',
      caption: 'Reliable APIs and data layers that don\'t fall over on launch day.',
      body: '',
      logos: [
        { src: 'logos/nodejs.svg',  label: 'Node.js' },
        { src: 'logos/php.svg',     label: 'PHP' },
        { src: 'logos/laravel.svg', label: 'Laravel' },
        { src: 'logos/python.svg',  label: 'Python' },
        { src: 'logos/go.svg',      label: 'Go' }
      ]
    },
    {
      tag: '03 · Databases',
      title: 'Where the data lives',
      caption: 'From relational to document stores — we pick the right tool for the shape of your data.',
      body: '',
      logos: [
        { src: 'logos/postgresql.svg', label: 'PostgreSQL' },
        { src: 'logos/mysql.svg',      label: 'MySQL' },
        { src: 'logos/mongodb.svg',    label: 'MongoDB' },
        { src: 'logos/redis.svg',      label: 'Redis' }
      ]
    },
    {
      tag: '04 · Cloud & Infra',
      title: 'Where it lives and how it scales',
      caption: 'Deployment, CI/CD, and infrastructure that doesn\'t need a PhD to maintain.',
      body: '',
      logos: [
        { src: 'logos/aws.svg',       label: 'AWS' },
        { src: 'logos/docker.svg',    label: 'Docker' },
        { src: 'logos/terraform.svg', label: 'Terraform' }
      ]
    },
    {
      tag: '05 · Commerce & CMS',
      title: 'For stores and content teams',
      caption: 'Platforms your marketing team can actually use without filing a ticket.',
      body: '',
      logos: [
        { src: 'logos/shopify.svg',   label: 'Shopify' },
        { src: 'logos/wordpress.svg', label: 'WordPress' },
        { src: 'logos/stripe.svg',    label: 'Stripe' }
      ]
    },
    {
      tag: '06 · Experimental',
      title: 'For when "different" matters',
      caption: '3D, cross-platform, and API-first work when a standard setup won\'t cut through.',
      body: '',
      logos: [
        { src: 'logos/apple.svg',   label: 'iOS',      light: true },
        { src: 'logos/android.svg', label: 'Android' },
        { src: 'logos/threejs.svg', label: 'Three.js', light: true },
        { src: 'logos/graphql.svg', label: 'GraphQL' }
      ]
    }
  ];
}
