import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import {SERVER_URL} from '../constants.js'
import Grid from '@mui/material/Grid';
import {DataGrid} from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AddStudent from './AddStudent';

// NOTE:  for OAuth security, http request must have
//   credentials: 'include' 

// properties year, semester required
//  
//  NOTE: because SchedList is invoked via <Route> in App.js  
//  props are passed in props.location

class StudentList extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      students: [],
      isAdmin: false 
    };
  } 
  
  componentDidMount() {
    this.fetchStudents();
    this.checkIsAdmin();
  }
  
  fetchStudents = () => {
    console.log("StudentList.fetchStudents");
    const token = Cookies.get('XSRF-TOKEN');
    
    fetch(`${SERVER_URL}/student`, 
      {  
        method: 'GET', 
        headers: { 'X-XSRF-TOKEN': token },
        credentials: 'include'
      } )
    .then((response) => {
      console.log("FETCH RESP:"+response);
      return response.json();}) 
    .then((responseData) => { 
      // do a sanity check on response
      if (Array.isArray(responseData)) {
        responseData.forEach(s => { s.id = s.student_id })
        this.setState({ 
          students: responseData
        });
      } else {
        toast.error("Fetch failed.", {
          position: toast.POSITION.BOTTOM_LEFT
        });
      }        
    })
    .catch(err => {
      toast.error("Fetch failed.", {
          position: toast.POSITION.BOTTOM_LEFT
        });
        console.error(err); 
    })
  }



  // Delete Student 
  onDelClick = (id) => {
    if (window.confirm('Are you sure you want to delete the student?')) {
      const token = Cookies.get('XSRF-TOKEN');
      
      fetch(`${SERVER_URL}/student/${id}`,
        {
          method: 'DELETE',
          headers: { 'X-XSRF-TOKEN': token },
          credentials: 'include'
        })
    .then(res => {
        if (res.ok) {
          toast.success("Student successfully deleted", {
              position: toast.POSITION.BOTTOM_LEFT
          });
          this.fetchStudents();
        } else {
          toast.error("Student Delete failed", {
              position: toast.POSITION.BOTTOM_LEFT
          });
          console.error('Delete http status =' + res.status);
    }})
      .catch(err => {
        toast.error("Student delete failed", {
              position: toast.POSITION.BOTTOM_LEFT
        });
        console.error(err);
      }) 
    } 
  }

  // Add Student
  addStudent = (student) => {
    const token = Cookies.get('XSRF-TOKEN');
 
    fetch(`${SERVER_URL}/student`,
      { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json',
                   'X-XSRF-TOKEN': token  }, 
        credentials: 'include',
        body: JSON.stringify(student)
      })
    .then(res => {
        if (res.ok) {
          toast.success("Student successfully added", {
              position: toast.POSITION.BOTTOM_LEFT
          });
          this.fetchStudents();
        } else {
          toast.error("Error when adding", {
              position: toast.POSITION.BOTTOM_LEFT
          });
          console.error('Post http status =' + res.status);
        }})
    .catch(err => {
      toast.error("Error when adding", {
            position: toast.POSITION.BOTTOM_LEFT
        });
        console.error(err);
    })
  } 


  checkIsAdmin = () => {

    let isAdmin = false;
    const token = Cookies.get('XSRF-TOKEN');

    fetch(
        `${SERVER_URL}/admin`,
        {
            method: 'GET',
            headers: { 'Content-Type': 'application/json',
                       'X-XSRF-TOKEN': token  },
            credentials: 'include'
        })
        .then((res) => {
            if (res.status == 200) {
                isAdmin =  true;
            } else {
                isAdmin =  false;
            }
        })
        .catch(err => {
            toast.error("Fetch failed.", {
                position: toast.POSITION.BOTTOM_LEFT
            });
            console.error(err);
            isAdmin = false; 
        })
        .finally(() => {
            this.setState({
                isAdmin: isAdmin
            })
        })        
}



  render() {
     const columns = [
      { field: 'student_id', headerName: 'ID', width: 125 },
      { field: 'name', headerName: 'Name', width: 400 },
      { field: 'email', headerName: 'Email', width: 400 },
      { field: 'status', headerName: 'Status', width: 150 },
      { field: 'status_code', headerName: 'Status Code',  width: 150 },
      { field: 'id', headerName: '  ', sortable: false, width: 200,
        renderCell: (params) => isAdmin && (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              style={{ marginLeft: 16 }} 
              onClick={()=>{this.onDelClick(params.value)}}
            >
              Delete
            </Button>
        )
      }
      ];
      const isAdmin = this.state.isAdmin
  
  return(
      <div>
          <AppBar position="static" color="default">
            <Toolbar>
               <Typography variant="h6" color="inherit">
                  { 'Students ' }
                </Typography>
            </Toolbar>
          </AppBar>
          <div className="App">
            <div style={{width:'100%'}}>
                For DEBUG:  display state.
                {JSON.stringify(this.state)}
            </div>
            {isAdmin && (
            <Grid container>
              <Grid item>
			    <ButtonGroup>
                  <AddStudent addStudent={this.addStudent}  />
				</ButtonGroup>
              </Grid>
            </Grid>
            )}
            <div style={{ height: 400, width: '100%' }}>
              <DataGrid rows={this.state.students} columns={columns} />
            </div>
            <ToastContainer autoClose={1500} />   
          </div>
      </div>
      ); 
  }
}

export default StudentList;