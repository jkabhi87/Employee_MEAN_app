import { Injectable } from '@angular/core';
import { Employee } from './employee';
import { Http, Response } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private empUrl = 'http://localhost:3000/api/employees';
  constructor(private http: Http) { }

  // get("/api/employees")
  getEmployees(): Promise<void |Employee[]> {
    return this.http.get(this.empUrl)
                .toPromise()
                .then(response => response.json() as Employee[])
                .catch(this.handleError);
  }

  // post("/api/employees")
  createEmployee(newEmployee: Employee): Promise<void | Employee> {
    return this.http.post(this.empUrl, newEmployee)
                      .toPromise()
                      .then(response => response.json() as Employee)
                      .catch(this.handleError);
  }

  // delete("/api/employees/:id")
  deleteEmployee(delEmployeeId: string): Promise<void | String> {
    return this.http.delete(this.empUrl + '/' + delEmployeeId)
                .toPromise()
                .then(response => response.json() as String)
                .catch(this.handleError);
  }

  // put("/api/employees/:id")
  updateEmployee(putEmployee: Employee): Promise<void | Employee> {
    let putUrl = this.empUrl + '/' + putEmployee._id;
    return this.http.put(putUrl, putEmployee)
                .toPromise()
                .then(response => response.json() as Employee)
                .catch(this.handleError);
  }

  // Generic Error handling method
  private handleError(error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
  }


}
