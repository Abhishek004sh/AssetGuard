import {
    useState,
    useRef,
    useEffect
} from "react";

import Layout from "../components/Layout";
import { askAssets } from "../services/ai.service";
import {
    PageHeading,
    ErrorBanner,
    EmptyState,
    Row,
    inputCls,
    primaryBtnCls,
    secondaryBtnCls
} from "../components/ui";


const exampleQuestions = [
    "Which warranties expire in the next 30 days?",
    "What subscriptions renew this week?",
    "How much do I spend on subscriptions each month?",
    "Which assets have no warranty date set?"
];


function AskAI(){

    const [question,setQuestion] = useState("");
    const [messages,setMessages] = useState([]);
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState("");

    const bottomRef = useRef(null);


    // Keep the newest message in view.
    useEffect(()=>{

        bottomRef.current?.scrollIntoView({ behavior:"smooth" });

    },[messages,loading]);


    const sendQuestion = async(text)=>{

        const trimmed = text.trim();

        if(!trimmed || loading) return;

        setError("");
        setQuestion("");
        setLoading(true);

        setMessages(prev => [...prev, { role:"user", text:trimmed }]);

        try{

            const data = await askAssets(trimmed);

            setMessages(prev => [...prev, { role:"ai", text:data.answer }]);

        }
        catch(err){

            setError(
                err.response?.data?.message ||
                "Something went wrong. Please try again."
            );

        }
        finally{

            setLoading(false);

        }

    };


    const handleSubmit = (e)=>{

        e.preventDefault();

        sendQuestion(question);

    };


    return (

        <Layout>

            <PageHeading>
                Ask AI
            </PageHeading>

            <p className="text-sm text-slate mb-5 max-w-2xl">
                Ask a question about the assets and subscriptions in the
                workspace you have selected. Answers come only from your
                own data, and AI can make mistakes, so double-check
                anything important.
            </p>

            <ErrorBanner>{error}</ErrorBanner>


            <div className="max-w-3xl">

                {messages.length === 0 && (

                    <div className="mb-5">

                        <EmptyState>
                            Try one of these questions
                        </EmptyState>

                        <div className="flex flex-wrap gap-2 mt-3">

                            {exampleQuestions.map((example)=>(

                                <button
                                key={example}
                                type="button"
                                className={secondaryBtnCls}
                                onClick={()=>sendQuestion(example)}
                                >
                                    {example}
                                </button>

                            ))}

                        </div>

                    </div>

                )}


                <div className="space-y-3 mb-5">

                    {messages.map((message,index)=>(

                        <Row
                        key={index}
                        className={
                            message.role === "user"
                                ? "bg-ink/5"
                                : ""
                        }
                        >

                            <p className="text-xs font-mono text-slate mb-1">
                                {message.role === "user" ? "You" : "AssetGuard AI"}
                            </p>

                            {/* whitespace-pre-wrap keeps the line breaks and
                                lists the AI writes. React escapes the text,
                                so nothing in it can run as HTML. */}
                            <p className="text-sm text-ink whitespace-pre-wrap">
                                {message.text}
                            </p>

                        </Row>

                    ))}


                    {loading && (

                        <Row>
                            <p className="text-sm text-slate">
                                Thinking...
                            </p>
                        </Row>

                    )}

                    <div ref={bottomRef} />

                </div>


                <form
                onSubmit={handleSubmit}
                className="flex gap-3"
                >

                    <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. Which warranties expire next month?"
                    value={question}
                    maxLength={500}
                    onChange={(e)=>setQuestion(e.target.value)}
                    />

                    <button
                    type="submit"
                    className={primaryBtnCls}
                    disabled={loading || !question.trim()}
                    >
                        Ask
                    </button>

                </form>

            </div>

        </Layout>

    );

}


export default AskAI;
