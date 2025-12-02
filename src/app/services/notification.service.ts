import { Injectable } from '@angular/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationsConfigurations: Partial<IndividualConfig> = {
    progressBar: true,
    closeButton: true,
    positionClass: 'toast-top-right',
    timeOut: 4000,
  };

  constructor(private readonly toastrService: ToastrService) {}

  public success(message: string) {
    this.toastrService.success(message, '', this.notificationsConfigurations);
  }

  public info(message: string) {
    this.toastrService.info(message, '', this.notificationsConfigurations);
  }

  public warning(message: string) {
    this.toastrService.warning(message, '', this.notificationsConfigurations);
  }

  public error(message: string) {
    this.toastrService.error(message, '', this.notificationsConfigurations);
  }
}
