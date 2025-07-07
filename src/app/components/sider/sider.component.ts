import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-sider',
  templateUrl: './sider.component.html',
  styleUrl: './sider.component.scss',
  imports: [RouterLink, NzMenuModule, NzIconModule],
})
export class SiderComponent {
  @Input() isCollapsed: boolean = false;
}
