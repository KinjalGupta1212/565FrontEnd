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

import "./App.css";

import {
  VictoryChart,
  VictoryBar,
  VictoryTheme,
  VictoryAxis,
  VictoryContainer,
} from "victory";

const GUIDING_TOOLTIP_SLOT_PROPS = {
  tooltip: {
    className: "guiding-tooltip-slot",
    sx: {
      maxWidth: 400,
      px: 2,
      py: 1.5,
      bgcolor: "rgba(15, 23, 42, 0.82)",
      color: "#f1f5f9",
      fontSize: "0.8125rem",
      fontFamily: "var(--sans)",
      lineHeight: 1.45,
      border: "1px solid rgba(248, 250, 252, 0.14)",
      boxShadow: "0 10px 28px rgba(0, 0, 0, 0.18)",
      backdropFilter: "blur(8px)",
    },
  },
} as const;

function GuidingQuestionsTooltipBody({ questions }: { questions: string[] }) {
  return (
    <div className="guiding-tooltip">
      {questions.map((q, i) => {
        const lines = q
          .split(/\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        if (lines.length === 0) return null;
        return (
          <div key={i} className="guiding-tooltip__question">
            {lines.map((line, j) => (
              <div key={j} className="guiding-tooltip__line">
                {j === 0 ? `– ${line}` : line}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

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
  const [tableInfo, setTableInfo] = useState<Record<string, Record<string, string[]>>>({});
  const [displayAttributesForTable, setDisplayAttributesForTable] = useState<Option[]>([]);
  const [displayOnSubmit, setDisplayOnSubmit] = useState(false);
  const [guidingQuestions, setGuidingQuestions] = useState<Record<string, string[]>>({});
  const [similarComments, setSimilarComments] = useState<Record<string, string[]>>({});
  const [disagreeingComments, setDisagreeingComments] = useState<Record<string, Record<string, number>>>({});
  const table_rows = Object.entries(tableInfo).map(
    ([comment, rating]) => ({
      name: comment,
      labels: rating,
    })
  ); 

// const mockTableInfo = {
//    "sentiment":{
//          "questions":[
//                "Does the comment express a dislike or hatred towards a specific group?",
//                "Is there any indication of violent intentions or wishes in the comment?",
//                "Does the comment use strong language to convey negative feelings towards the group?"
//               ],
//       "similar_comments":[
//          "Hate from india",
//          "You sure love to hate on Indians."
//       ],
//       "disagreeing_comments":{
//          "As an Indian I love this post":{
//             "strongly negative":0,
//             "somewhat negative":0,
//             "neutral":1,
//             "somewhat positive":1,
//             "strongly positive":1
//          },
//          "LOL. Barbaric and brainwashed clowns making comments about India... They love to display their ignorance and stupidity, which is a result of their limited intelligence.":{
//             "strongly negative":0,
//             "somewhat negative":1,
//             "neutral":0,
//             "somewhat positive":1,
//             "strongly positive":0
//          }
//       }
//    },
//    "table_info":{
//       "Hate from india":
//         {
//          "sentiment":["somewhat negative"]
//         }
//       ,
//       "You sure love to hate on Indians.":
//         {
//          "sentiment": ["neutral"]
//         }
//       ,
//       "I hate Indians they are terrorists. Killing thousands people in Kashmir.":
//         { 
//          "sentiment": ["strongly negative"] 
//         }
//       ,
//       "now we hate india lot of more":
//         { 
//          "sentiment": ["somewhat negative"]
//         }
//       ,
//       "Only motherfuckers hate India,":
//         { 
//           "sentiment": ["somewhat negative"]
//         }
//       ,
//       "suggestion":
//          { 
//             "sentiment":
//             [
//               "strongly negative",
//               "somewhat negative",
//               "neutral"
//             ]
//         }
    
//    },
//    "targeted_subgroups":[
//       "{\"National origin or citizenship status\": [\"A specific country\"]}"
//    ]
// }
  
  const handleSubmit = async () => 
  {
    if (selected.length === 0) {
      alert("Please select at least one survey item.");
      return;
    }
    if (comment === "") {
      alert("Please put in a comment to annotate.");
      return;
    }
    const selectedOptions = new Set(selected.map((option) => option.value));
    setDisplayAttributesForTable(selected);
    try {
      const response = await fetch('https://five65backendserver.onrender.com/chat', {
        method: 'POST',
        body: JSON.stringify({ query: comment, attributes: selectedOptions }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    
      const data = await response.json();
      let guiding_questions: Record<string, string[]> = {};
      let similar_comments: Record<string, string[]> = {};
      let disagreeing_comments: Record<string, Record<string, number>> = {};
      for (const key of Object.keys(data))
      {
        if (key === "table_info" || key === "targeted_subgroups" || !selectedOptions.has(key))
        {
          continue;
        }
        else
        {
          guiding_questions[key] = data[key]["questions"];
          similar_comments[key] = data[key]["similar_comments"];
          disagreeing_comments[key] = data[key]["disagreeing_comments"];
        }
      }
      setGuidingQuestions(guiding_questions);
      setTableInfo(data.table_info);
      setSimilarComments(similar_comments);
      setDisagreeingComments(disagreeing_comments);
      setDisplayOnSubmit(true); 
      
  } catch(err){
    console.log(err);
  }
}
  return (
  <>
  <div className="form-intro">
    <h1 className="app-title">Data Annotation Assistant</h1>
  </div>
  <div className="info-blurb form-blurb">
    <p className="info-blurb__lead">
      Enter the comment you want to annotate and select the survey items where you need help.
    </p>
    <p className="info-blurb__para">
      Add your annotation comment in the text box, then choose one or more survey items from the
      dropdown before submitting.
    </p>
  </div>
  <div className="form-container">

    {/* Input */}
    <div className="form-field">
      <input
        type="text"
        className="form-input"
        onChange={(e) => setComment(e.target.value)}
        placeholder="Enter comment..."
      />
    </div>

    {/* Dropdown */}
    <div className="form-field">
      <Select
        className="react-select-container"
        classNamePrefix="react-select"
        isMulti
        options={options}
        value={selected}
        onChange={(newValue) => setSelected(newValue as Option[])}
        placeholder="Select survey items..."
      />
    </div>

    {/* Button */}
    <div className="form-field">
      <button className="form-button" onClick={handleSubmit}>
        Submit
      </button>
    </div>

  </div>

    {displayOnSubmit && (
    <div className="info-blurb">
      <p className="info-blurb__lead">
        The table below shows five example comments that are semantically similar to your input.
      </p>
      <p className="info-blurb__para">
        For each selected survey item, the ratings shown are the average outcomes from past
        annotators on those similar comments.
      </p>
      <p className="info-blurb__para">
        The final row labeled <strong>suggestion</strong> contains suggested LLM ratings for your
        input comment.
      </p>
    </div>
    )}
    {displayOnSubmit && (
    <TableContainer component={Paper} className="annotation-table" elevation={0}>
      <Table className="annotation-table__table" sx={{ minWidth: 650 }} aria-label="annotation results">
        <TableHead>
          <TableRow>
            <TableCell align="left" className="annotation-table__head-cell">Comment</TableCell>
            {displayAttributesForTable.map((key) => (
              <TableCell align="left" key={key.label} className="annotation-table__head-cell">
                <div className="annotation-table__head-wrap">
                  <span className="annotation-table__head-text">{key.label}</span>
                  <Tooltip
                    describeChild
                    placement="top"
                    slotProps={GUIDING_TOOLTIP_SLOT_PROPS}
                    title={
                      <GuidingQuestionsTooltipBody
                        questions={guidingQuestions[key.value] || []}
                      />
                    }
                  >
                    <span
                      className="annotation-table__info-bubble"
                      tabIndex={0}
                      role="img"
                      aria-label={`Guiding questions for ${key.label}`}
                    >
                      <span className="annotation-table__info-bubble-char" aria-hidden="true">
                        i
                      </span>
                    </span>
                  </Tooltip>
                </div>
              </TableCell>
            )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {table_rows.map((row) => {
            const isSuggestionRow = row.name === "suggestion";
            return <>
              <TableRow
                key={row.name}
                className="annotation-table__body-row"
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 }
                }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  className="annotation-table__comment-cell"
                  sx={{ backgroundColor: isSuggestionRow ? "#ece7f1" : "inherit" }}
                >
                  {row.name}
                </TableCell>
                {displayAttributesForTable.map((attribute) => {
                  const ratings = row.labels[attribute.value] || [];
                  return (
                    <TableCell
                      key={attribute.value}
                      align="left"
                      className="annotation-table__body-cell"
                      sx={{ backgroundColor: isSuggestionRow ? "#ece7f1" : "inherit" }}
                    >
                      {ratings.join(", ")}
                    </TableCell>
                  );
                })}
              </TableRow>  
            </>
          }
          )}
        </TableBody>
      </Table>
    </TableContainer>
    )}
    {displayOnSubmit && (
    <div className="info-blurb">
      <p className="info-blurb__lead">
        For each attribute below, you’ll see two kinds of comparisons: comments with{" "}
        <strong>similar</strong> ratings to yours, and comments with{" "}
        <strong>dissimilar</strong> ratings.
      </p>
      <p className="info-blurb__para">
        <strong>Similar comments</strong> are the ones that are most semantically like your
        comment and tended to receive similar ratings from past annotators.
      </p>
      <p className="info-blurb__para">
        <strong>Disagreeing comments</strong> are also semantically like your comment, but past
        annotators gave them noticeably different ratings.
      </p>
    </div>
    )}
    {displayAttributesForTable.map((key) => (
      <details key={key.value} className="attribute-collapse" open>
        <summary className="attribute-collapse__summary">
          <h2 className="attribute-collapse__title">{key.label}</h2>
        </summary>
        <div className="attribute-collapse__body">
          <h3>Similar Comments</h3>

          <ul className="comment-list">
            {(similarComments[key.value] || []).map((q, i) => (
              <li key={i} className="result-comment">
                {q}
              </li>
            ))}
          </ul>

          <h3>Disagreeing Comments</h3>
          <ul className="comment-list disagreeing-list">
            {Object.entries(disagreeingComments[key.value] || {}).map(([comment, scores]) => {
              const graph_data = Object.entries(scores).map(([rating_class, count]) => ({
                x: rating_class,
                y: count,
              }));

              return (
                <li key={comment} className="disagreeing-list__item">
                  <div className="chart-wrap">
                    <p className="result-comment chart-wrap__comment">{comment}</p>

                    <div className="chart-responsive">
                      <VictoryChart
                        width={560}
                        height={320}
                        domainPadding={{ x: 20 }}
                        padding={{ top: 24, bottom: 112, left: 72, right: 28 }}
                        theme={VictoryTheme.clean}
                        containerComponent={
                          <VictoryContainer
                            responsive
                            style={{ width: "100%", height: "100%" }}
                          />
                        }
                      >
                        <VictoryAxis
                          label="Rating"
                          style={{
                            axisLabel: {
                              fontFamily: "inherit",
                              fontSize: 13,
                              fontWeight: 700,
                              fill: "#7f7385",
                              padding: 72,
                            },
                            tickLabels: {
                              fontFamily: "inherit",
                              fontSize: 11,
                              angle: -32,
                              textAnchor: "end",
                              padding: 4,
                              fill: "#7f7385",
                            },
                            axis: { stroke: "#cbd5e1" },
                            ticks: { stroke: "#cbd5e1", size: 5 },
                          }}
                        />
                        <VictoryAxis
                          dependentAxis
                          label="Number of Annotators"
                          style={{
                            axisLabel: {
                              fontFamily: "inherit",
                              fontSize: 13,
                              fontWeight: 700,
                              fill: "#7f7385",
                              padding: 60,
                            },
                            tickLabels: {
                              fontFamily: "inherit",
                              fontSize: 11,
                              fill: "#b8acc0",
                            },
                            axis: { stroke: "#d5d5d5" },
                            grid: { stroke: "#e4e4e4", strokeDasharray: "4 4" },
                            ticks: { stroke: "#d5d5d5", size: 5 },
                          }}
                        />
                        <VictoryBar
                          data={graph_data}
                          barRatio={0.7}
                          style={{ data: { fill: "#8f8396", fillOpacity: 1 } }}
                          cornerRadius={3}
                        />
                      </VictoryChart>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </details>
    ))}
  </>
  );
};



export default App;