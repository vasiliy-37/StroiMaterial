import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  readonly i18n = inject(LanguageService);

  readonly categoryLinks = [
    { key: 'nav.materials', category: 'materials' },
    { key: 'nav.tools', category: 'tools' },
    { key: 'nav.electric', category: 'electric' },
    { key: 'nav.plumbing', category: 'plumbing' },
    { key: 'nav.garden', category: 'garden' },
    { key: 'nav.paint', category: 'paint' },
  ] as const;

  t(key: string): string {
    return this.i18n.t(key);
  }
}
