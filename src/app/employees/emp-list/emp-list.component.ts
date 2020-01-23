import { Component, OnInit } from '@angular/core';
import { Employee } from '../employee';
import { EmployeeService } from '../employee.service';
import { EmpDetailsComponent } from '../emp-details/emp-details.component';



@Component({
  selector: 'app-emp-list',
  templateUrl: './emp-list.component.html',
  styleUrls: ['./emp-list.component.css'],
  providers: [EmployeeService]
})
export class EmpListComponent implements OnInit {

  employees: Employee[];
  selectedEmployee: Employee; // To keep track of currently selected record

  constructor(private employeeService: EmployeeService) { }

  // Load all the records when the app loads
  ngOnInit() {
    this.employeeService
      .getEmployees()
      .then((employees: Employee[]) => {
                    this.employees = employees.map((employee) => {
                      return employee;
                    });
                  }).catch((err) => {
                    console.log(err);
                    console.log('Failed to load all employees on init');
                  });
  }

  // This method is used to retrieve the index of a employee record in the local empoyees copy in front end.
  private getIndexOfEmployee = (empId: string) => {
    return this.employees.findIndex((employee) => {
      return employee._id === empId;
    });
  }

  // Method to keep tack of the selected record
  selectEmployee(employee: Employee) {
    this.selectedEmployee = employee;
  }

  // Method to create a empty employee record for the new employee form
  createNewEmployee() {
    let employee: Employee = {
      firstName: '',
      lastName: '',
      hireDate: '',
      role: '',
      favoriteJoke: '',
      favoriteQuote: ''
    };

    // By default, a newly-created contact will have the selected state.
    this.selectEmployee(employee);
  }

  // Method to delete the employee record in the FE
  deleteEmployee = (empId: string) => {
    const idx = this.getIndexOfEmployee(empId);
    if (idx !== -1) {
      this.employees.splice(idx, 1);
      this.selectEmployee(null);
    }
    return this.employees;
  }

  // Method to add an employee
  addEmployee = (employee: Employee) => {
    try {
      if (employee._id) {
        this.employees.push(employee);
        this.selectEmployee(employee);
        return this.employees;
      }
    } catch {
      console.log('Check values entered for these fields: firstName, lastName, hireDate (YYYY-MM-DD format earlier than current date),'
       + 'role [CEO (only once), VP, MANAGER, or LACKEY]');
      return this.employees;
    }

  }

  // Method for updating a record
  updateEmployee = (employee: Employee) => {
    try {
    let idx = this.getIndexOfEmployee(employee._id);
    if (idx !== -1) {
      this.employees[idx] = employee;
      this.selectEmployee(employee);
    }
    return this.employees;
  } catch {
      console.log('Please check the fields you are trying to update');
      return this.employees;
    }
  }
}
