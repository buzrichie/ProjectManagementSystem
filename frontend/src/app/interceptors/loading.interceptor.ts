import {
  HttpEventType,
  HttpHandlerFn,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { tap } from 'rxjs/operators';
// import { SpinnerService } from '../services/spinner.service';
import { SpinnerService } from '../services/utils/spinner.service';
import { Observable } from 'rxjs';

export function loadingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const spinnerService = inject(SpinnerService);
  // console.log(req);

  spinnerService.reset();
  spinnerService.show();
  return next(req).pipe(
    tap({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.Response) {
          spinnerService.hide();
        }
      },
      error: (error: HttpErrorResponse) => {
        spinnerService.hide();
      },
    })
  );
}
