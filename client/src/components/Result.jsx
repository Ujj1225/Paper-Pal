import React, { useState } from "react";
import { CiCircleQuestion } from "react-icons/ci";
import {
  useQnaMutation,
  useTranslateMutation,
} from "../slices/summarizeApiSlice";

const Result = ({ res }) => {
  const [chat, setChat] = useState(false);
  const [question, setQuestion] = useState("");
  const [qaPairs, setQaPairs] = useState([]);
  const [selectedLang, setSelectedLang] = useState("en");
  const [translatedText, setTranslatedText] = useState("");

  const [qna, { isLoading }] = useQnaMutation();
  const [translate, { isLoading: translating }] = useTranslateMutation();

  const languages = [
    { label: "French", value: "fr" },
    { label: "Spanish", value: "es" },
    { label: "Hindi", value: "hi" },
    { label: "Nepali", value: "ne" },
  ];

  const handleQuestionSubmit = async () => {
    if (question.trim() === "") return;
    try {
      const combinedMessage = `Here is the summary of the paper: "${res.reply}". Now, answer the following question based on the summary: ${question}`;
      const qnaRes = await qna({ message: combinedMessage }).unwrap();
      const jsonString = qnaRes.join("");
      const parsedRes = JSON.parse(jsonString);
      const formattedQuestion = parsedRes.question.replace(" (explain)", "");
      setQaPairs([
        ...qaPairs,
        { question: formattedQuestion, answer: parsedRes },
      ]);
      setQuestion("");
    } catch (error) {
      console.error("Failed to fetch the answer:", error);
    }
  };

  const handleTranslationSubmit = async () => {
    try {
      const translationRes = await translate({
        text: res.reply, // or wherever the summary text is,
        sourceLang: "en", // assuming the original summary is in English
        targetLang: selectedLang,
      }).unwrap();

      setTranslatedText(translationRes.translatedText);
    } catch (error) {
      console.error("Translation failed:", error);
    }
  };

  return (
    <div>
      <div
        style={{
          outline: "1px solid black",
          marginTop: "1rem",
          marginLeft: "4rem",
          marginRight: "4rem",
          borderRadius: "0.5rem",
          padding: "2rem",
          background:
            "linear-gradient(to bottom,rgba(255, 255, 255, 0.2) 0%,rgba(0, 0, 0, 0.15) 100%)",
        }}
      >
        <h2>Brief Summary Of The Paper Submitted</h2>

        <p>{translatedText || res.reply}</p>
        <div style={{ marginTop: "1rem" }}>
          <label htmlFor="language-select">Translate to: </label>
          <select
            id="language-select"
            value={selectedLang}
            className="select-bg"
            onChange={(e) => setSelectedLang(e.target.value)}
          >
            <option value="en">English</option>
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleTranslationSubmit}
            style={{ marginLeft: "1rem" }}
            className="select-bg-btn"
          >
            {translating ? "Translating..." : "Translate"}
          </button>
        </div>
      </div>
      {!chat ? (
        <div
          style={{ marginTop: "4rem", marginLeft: "4rem", marginRight: "4rem" }}
        >
          Have any questions regarding the paper?{" "}
          <span
            style={{ fontWeight: 900, cursor: "pointer", color: "blue" }}
            onClick={() => {
              setChat(true);
            }}
          >
            Ask now!
          </span>
        </div>
      ) : (
        <div
          style={{
            outline: "1px solid black",
            marginTop: "1rem",
            marginLeft: "4rem",
            marginRight: "4rem",
            borderRadius: "0.5rem",
            padding: "1rem",
            background:
              "linear-gradient(to bottom,rgba(255, 255, 255, 0.2) 0%,rgba(0, 0, 0, 0.15) 100%)",
            position: "relative",
            height: "20rem",
          }}
        >
          <div style={{ maxHeight: "18rem", overflow: "scroll" }}>
            {qaPairs.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "5rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                <CiCircleQuestion size={30} />
                Ask Your First Question
              </div>
            ) : (
              <div
                style={{
                  border: "0.2px solid black",
                  padding: "0.25rem",
                  borderRadius: "0.25rem",
                }}
              >
                {qaPairs.map((qa, index) => (
                  <div key={index} style={{ marginBottom: "1rem" }}>
                    <p style={{ fontWeight: "bold" }}>Q: {qa.question}</p>
                    <p>A: {qa.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 5,
              left: 100,
              display: "flex",
              width: "80%",
              margin: "auto",
              gap: 4,
            }}
          >
            <input
              className="chat-ip"
              style={{
                width: "90%",
                backgroundColor: "grey",
                border: "1px solid black",
                borderRadius: "0.25rem",
                padding: "0.5rem 1rem",
              }}
              value={question}
              placeholder="Ask questions regarding research paper..."
              onChange={(e) => {
                setQuestion(e.target.value);
              }}
            />
            <button
              style={{
                width: "8%",
                backgroundColor: "grey",
                border: "1px solid black",
                borderRadius: "0.25rem",
                cursor: "pointer",
              }}
              onClick={handleQuestionSubmit}
            >
              {isLoading ? "Asking..." : "Ask"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Result;
