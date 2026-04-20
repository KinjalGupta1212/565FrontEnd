import React, { useState } from "react";
import Select from "react-select";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Tooltip from "@mui/material/Tooltip";

type Option = {
  label: string;
  value: string;
};

const options: Option[] = [
  { label: "Sentiment", value: "sentiment" },
  { label: "Respect", value: "respect" },
  { label: "Insult", value: "insult" },
  { label: "Humiliate", value: "humiliate" },
  { label: "Status", value: "status" },
  { label: "Dehumanize", value: "dehumanize" },
  { label: "Violence", value: "violence" },
  { label: "Genocide", value: "genocide" },
  { label: "Attack-Defend", value: "attack_defent" },
  { label: "Hate speech", value: "hatespeech" },
];

const App: React.FC = () => {
  const [selected, setSelected] = useState<Option[]>([]);
  const [comment, setComment] = useState("")
  const [tableInfo, setTableInfo] = useState<Record<string, string[][]>>({});
  const [displayAttributesForTable, setDisplayAttributesForTable] = useState<Option[]>([]);
  const [displayTable, setDisplayTable] = useState(false);
  const [guidingQuestions, setGuidingQuestions] = useState<Record<string, string[]>>({});
  const table_rows = Object.entries(tableInfo).map(
    ([comment, rating]) => ({
      name: comment,
      labels: rating,
    })
  );  

const mockTableInfo = {
   "sentiment":{
         "questions":[
               "Does the comment express a dislike or hatred towards a specific group?",
               "Is there any indication of violent intentions or wishes in the comment?",
               "Does the comment use strong language to convey negative feelings towards the group?"
              ],
      "similar_comments":[
         "Hate from india",
         "You sure love to hate on Indians."
      ],
      "disagreeing_comments":{
         "As an Indian I love this post":{
            "strongly negative":0,
            "somewhat negative":0,
            "neutral":1,
            "somewhat positive":1,
            "strongly positive":1
         },
         "LOL. Barbaric and brainwashed clowns making comments about India... They love to display their ignorance and stupidity, which is a result of their limited intelligence.":{
            "strongly negative":0,
            "somewhat negative":1,
            "neutral":0,
            "somewhat positive":1,
            "strongly positive":0
         }
      }
   },
   "table_info":{
      "Hate from india":[
        [
         "somewhat negative"
        ]
      ],
      "You sure love to hate on Indians.":[
        [
         "neutral"
        ]
      ],
      "I hate Indians they are terrorists. Killing thousands people in Kashmir.":[
        [
         "strongly negative"
        ]
      ],
      "now we hate india lot of more":[
        [
         "somewhat negative"
        ]
      ],
      "Only motherfuckers hate India,":[
         [
            "somewhat negative"
         ]
      ],
      "suggestion":[
         [
            "strongly negative",
            "somewhat negative",
            "neutral"
         ]
      ]
   },
   "targeted_subgroups":[
      "{\"National origin or citizenship status\": [\"A specific country\"]}"
   ]
}
  
  const handleSubmit = async () => 
  {
    if (selected.length === 0) {
      alert("Please select at least one survey item")
    }
    if (comment === "") {
      alert("Please put in a comment to annotate");
      return;
    }
    setDisplayAttributesForTable(selected);
    let selected_options = selected.map((option) => option.value)
    try {
      // const response = await fetch('http://localhost:8000/chat', {
      //   method: 'POST',
      //   body: JSON.stringify({ query: comment, attributes: selected_options }),
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // });
    
      // const data = await response.json();
      const data = {table_info: mockTableInfo}
      let guiding_questions: Record<string, string[]> = {};
      for (const key of Object.keys(mockTableInfo))
      {
        if (key === "tableInfo" || key === "targeted_subgroups")
        {
          continue;
        }
        else
        {
          guiding_questions[key] = mockTableInfo[key]["questions"];
        }
      }
      setGuidingQuestions(guiding_questions);
      setTableInfo(mockTableInfo.table_info);
      setDisplayTable(true); 
      
  } catch(err){
    console.log(err);
  }
}
  return (
    <>
    <div style={{ width: 300, margin: "50px auto" }}>
      <Select
        isMulti
        options={options}
        value={selected}
        onChange={(newValue) => setSelected(newValue as Option[])}
        placeholder="Select options..."
      />
    </div>
    <input type="text" onChange={(e) => setComment(e.target.value)}></input>
    <button onClick={handleSubmit}>Submit</button>
    {displayTable && (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Comment</TableCell>
            {displayAttributesForTable.map((key) => (
              <TableCell align="left" key={key.label}>
              <Tooltip
                describeChild
                title={
                  <div style={{ whiteSpace: "pre-line" }}>
                    {(guidingQuestions[key.value] || [])
                      .map((q) => `- ${q}`)
                      .join("\n")}
                  </div>
  }
              >
                <div>{key.label}</div>
              </Tooltip>
              </TableCell>
            )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {table_rows.map((row) => {
            return <>
              <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                {row.labels.map((attribute_list, idx) => (
                  <TableCell key={idx} align="left">
                    {attribute_list.join(", ")}
                  </TableCell>
                ))}
              </TableRow>  
            </>
          }
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )}
  </>
  );
};

export default App;