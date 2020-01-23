import { Component, Input } from '@angular/core';
import { Employee } from '../employee';
import { EmployeeService } from '../employee.service';
import { error } from 'protractor';

@Component({
  selector: 'app-emp-details',
  templateUrl: './emp-details.component.html',
  styleUrls: ['./emp-details.component.css']
})
export class EmpDetailsComponent {

  @Input()
  employee: Employee; // Employee object from the page

  @Input()
  createHandler: Function; // handler function to call after employee creation in the backend
  @Input()
  updateHandler: Function; // handler function to call after employee update in the backend
  @Input()
  deleteHandler: Function; // handler function to call after employee delete in the backend

  constructor(private employeeService: EmployeeService) { }

  // This method invokes the service to create the employee record in the backend and if successful, passes on the
  // newly created object to the handler method in FE to update the local employee list
  createEmployee(employee: Employee) {
    this.employeeService.createEmployee(employee).then((newEmployee: Employee) => {
      this.createHandler(newEmployee);
    }).catch((error) => {
      console.log(error.status);
      console.log('Mandatory fields: firstName, lastName, hireDate (YYYY-MM-DD format earlier than current date),'
      + 'role [CEO (only once), VP, MANAGER, or LACKEY]');
    });
  }

  // This method invokes the service to update the employee record in the backend and if successful, passes on the
  // updated object to the handler method in FE to update the local employee list
  updateEmployee(employee: Employee): void {
    this.employeeService.updateEmployee(employee).then((updatedEmployee: Employee) => {
      this.updateHandler(updatedEmployee);
    }).catch((error) => {
      console.log(error.status);
      console.log('Mandatory fields: firstName, lastName, hireDate (YYYY-MM-DD format earlier than current date),'
      + 'role [CEO (only once), VP, MANAGER, or LACKEY]');
    });
  }

  //// This method invokes the service to delete the employee record in the backend and if successful, passes on the
  // id of the deleted object to the handler method in FE to update the local employee list
  deleteEmployee(empId: string): void {
    this.employeeService.deleteEmployee(empId).then((deletedEmpId: string) => {
      this.deleteHandler(deletedEmpId);
    });
  }

}
