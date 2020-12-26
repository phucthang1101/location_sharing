import React, { useState, useEffect } from "react";
import UserList from "../components/UserList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";

const Users = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setloadedUsers] = useState();
  // const USERS =[
  //     {
  //         id:'u1',
  //         name:'Thang Tran',
  //         image:'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQdpE--NCxD04iZdVKY0UC2mlGgaDI5YW1GpSQniyNuDDoqSKng',
  //         places:3
  //     }
  // ];

  //React Hook: useEffect => allow us to run certain code only when certain dependencies change:
  // the code which is run is define in the fuction which is our FIRST ARGUMENT
  // SECOND ARGUMENT is an array of dependencies of data that when its value change will call the effect
  // if it is empty it will only run once when the component was mounting
  // this hook is created to replace the ComponentDidMount() life cycle

  //do not code like : useEffect( async () => { ...await})
  //because it is not recommened. Instead just do it like this
  useEffect(() => {
    const fetchUsers = async () => {
      
      try {
        //with fetch(), the dafault request type is a GET request
        console.log(process.env.REACT_APP_BACKEND_URL + "/users")
        const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL + "/users");

        setloadedUsers(responseData.users);
      } catch (err) {
        
      }
      
    };
    fetchUsers();
  }, [sendRequest]);

  

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />

      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedUsers && <UserList items={loadedUsers} />}
    </React.Fragment>
  );
};

export default Users;
