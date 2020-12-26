import React, { useRef, useState, useEffect } from "react";
import "./ImageUpload.css";
import Button from "./Button";

const ImageUpload = (props) => {
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [isValid, setIsValid] = useState(false);

  const filePickerRef = useRef();

  useEffect(()=>{
      if(!file){
          return ;
      }
      const fileReader =new FileReader();
      fileReader.onload = () => {
          setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file)
  },[file])
  const pickedHandler = (event) => {
      let pickedFile;
      // Why u do this ? Why not pass isValid straight to onInput() function
      // When u use setIsValid(true) it doesn't update state right away, it will do it when all every state in the component update
      // so when we pass isValid to onInput func like this:
      //    props.onInput(props.id,pickedFile,isValid) => it not the right value

      let fileIsValid = isValid;
    if(event.target.files && event.target.files.length === 1 )
    {
         pickedFile = event.target.files[0];
        setFile(pickedFile);
        setIsValid(true);
        fileIsValid=true;
    }else{
        setIsValid(false);
        fileIsValid=false
    }

    props.onInput(props.id,pickedFile,fileIsValid)
  };

  const pickImageHandler = () => {
    filePickerRef.current.click();
  };

  return (
    <div className="form-control">
      <input
        id={props.id}
        ref={filePickerRef}
        style={{ display: "none" }}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={pickedHandler}
      />
      <div className={`image-upload ${props.center && "center"}`}>
        <div className="image-upload__preview">
          {previewUrl && <img src={previewUrl} alt="preview" />}
          {!previewUrl && <p>Please pick an image</p>}
        </div>
        <Button type="button" onClick={pickImageHandler}>
          PICK IMAGE
        </Button>
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>
  );
};

export default ImageUpload;
