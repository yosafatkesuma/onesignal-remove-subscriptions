import "./styles.css";
import * as React from "react";
import Papa from "papaparse";

const allowedExtensions = ["csv"];

export default function App() {
  // This state will store the parsed data
  const [appId, setAppId] = React.useState("");

  // It state will contain the error when
  // correct file extension is not used
  const [error, setError] = React.useState("");

  // It will store the file uploaded by the user
  const [file, setFile] = React.useState<any>("");
  const [loading, setLoading] = React.useState(false);

  const onChangeAppId = (e) => {
    setAppId(e.target.value);
  };

  // This function will be called when
  // the file input changes
  const handleFileChange = (e) => {
    setError("");

    // Check if user has entered the file
    if (e.target.files.length) {
      const inputFile = e.target.files[0];

      // Check the file extensions, if it not
      // included in the allowed extensions
      // we show the error
      const fileExtension = inputFile?.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        setError("Please input a csv file");
        return;
      }

      // If input type is correct set the state
      setFile(inputFile);
    }
  };

  const handleRemoveSubscription = () => {
    setLoading(true);
    // If user clicks the parse button without
    // a file we show a error
    if (!file) return alert("Enter a valid file");

    // Initialize a reader which allows user
    // to read any file or blob.
    try {
      const reader = new FileReader();

      // Event listener on reader when the file
      // loads, we parse it and set the data.
      reader.onload = async ({ target }) => {
        if (target) {
          const csv = Papa.parse(target?.result as any, {
            header: true,
          });

          const parsedData = csv?.data as any;

          if (parsedData) {
            const options = {
              method: "DELETE",
              headers: { accept: "application/json" },
            };
            for (let i = 0; i < parsedData.length; i++) {
              const url = `https://api.onesignal.com/apps/${appId}/subscriptions/${parsedData[i].player_id}`;
              await fetch(url, options)
                .then((res) => res.json())
                .then((json) => console.log(json));
            }
          }
        }
        reader.readAsText(file);
      };
    } catch (error) {
      error && setError(error.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Onesignal remove all subscription</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          name="appId"
          type="text"
          placeholder="OneSignal App Id"
          onChange={onChangeAppId}
        />
        <div style={{ gap: 8, display: "flex" }}>
          <input
            id="csvInput"
            name="file"
            type="file"
            onChange={handleFileChange}
            accept="*"
          />
          <div>
            <button onClick={handleRemoveSubscription} disabled={!file}>
              {loading ? "Loading..." : "Remove Subscription"}
            </button>
          </div>
        </div>
        <div style={{ marginTop: "3rem" }}>{error}</div>
      </div>
    </div>
  );
}
