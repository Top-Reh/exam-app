import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, {  useContext, useEffect, useState } from 'react'
import { db } from './firebase';
import { AuthContext } from './context/AuthContext';

const Studentver = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [totalMarks, setTotalMarks] = useState(0);
    const {currentUser} = useContext(AuthContext);
    const [showresults, setShowResults] = useState(false);
    const [subm,setSubm] = useState(false);
    const [openPopup, setOpenPopup] = useState(false);

    const handleAnswerChange = (question, value) => {
        setAnswers((prev) => ({
            ...prev,
            [question]: value,
        }));
    };

    useEffect(() => {
        const fetch = async () => {
            if (subm) {
                const results = questions.map((question) => {
                    const userAnswer = answers[question.Answers.question];
                    return {
                        question: question.Answers.question,
                        userAnswer: userAnswer,
                        isCorrect: userAnswer === question.Answers.correctAnswer,
                        mark: userAnswer === question.Answers.correctAnswer ? question.Answers.mark : 0,
                        correctAnswer: question.Answers.correctAnswer
                    };
                });
                console.log('Results:', results);
                const total = results.reduce((acc,result) => acc + Number(result.mark), 0);
                setTotalMarks(total);
                console.log('Total Marks:', total);
                await updateDoc(doc(db, "user", currentUser?.email), {
                    totalMarks: total,
                    results: results,
                });
                setSubm(false);
                return;
            }
        }
        fetch();
        console.log('openPopup:', openPopup);
    }, [subm]);

    useEffect(() => {
        const fetch = async () => {
            const querySnapshot = await getDocs(collection(db, "questions"));
            const questionsArray = [];
            querySnapshot.forEach((doc) => {
            questionsArray.push(doc.data());
            });
            setQuestions(questionsArray);
        };
        fetch();
    }, [ ]);
  return (
    <div className='w-full h-full flex justify-center items-center p-20 flex-col gap-4'>
        <h1 className='text-2xl font-bold text-center'>Student Version</h1>
        <p className='text-center'>This is the student version of the exam application.</p>
        <p className='text-center'>Students can view their results and answers here.</p>
        {
            showresults ? (
                <div className='flex flex-col gap-4'>
                    <h1 className='text-xl font-bold text-center'>Total Marks: {totalMarks}</h1>
                    <div>
                        <h2 className='text-lg font-semibold'>Results:</h2>
                        <ul className=' flex flex-col gap-4'>
                            {questions.map((question, index) => (
                                <li key={index} className='flex flex-col justify-center items-center gap-1 w-96 p-4 shadow-md rounded' style={{backgroundColor: question.Answers.correctAnswer===answers[question.Answers.question] ? 'lightgreen' : 'lightcoral'}}>
                                    <p className='bg-white w-full p-2 rounded-sm'><strong>Question:</strong> {question.Answers.question}</p>
                                    <p className='bg-white w-full p-2 rounded-sm'><strong>Your Answer:</strong> {answers[question.Answers.question]}</p>
                                    <p className='bg-white w-full p-2 rounded-sm'><strong>Correct Answer:</strong> {question.Answers.correctAnswer}</p>
                                    <p className='bg-white w-full p-2 rounded-sm'><strong>Marks:</strong> {question.Answers.correctAnswer===answers[question.Answers.question] ? question.Answers.mark : '0'}</p>
                                    <hr />
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button className='p-3 bg-blue-200 rounded-md' onClick={() => {setShowResults(false); setAnswers({})}}>Back to answer</button>
                </div>
            ) : <form onSubmit={(e) => {
                e.preventDefault();
                setOpenPopup(true);
            }} className="flex flex-col gap-4 w-full items-center">
            {questions.map((data, index) => (
                data.Answers.type ==='multiple-choice' ? (
                    <div
                        key={index}
                        className='flex flex-col justify-center items-center gap-4 w-96 p-4 bg-blue-200 shadow-md rounded'
                    >
                        <label className='text-md font-bold'>{data.Answers.question}</label>
                        <ul className='grid grid-cols-2 gap-4 w-full'>
                            {['answer1', 'answer2', 'answer3', 'answer4'].map((key) => (
                                <li key={key} className='flex items-center gap-2'>
                                    {
                                        data.Answers[key] && (
                                        <input
                                            type='radio'
                                            name={`question-${index}`}
                                            value={data.Answers[key]}
                                            checked={answers[data.Answers.question] === data.Answers[key]}
                                            onChange={(e) => handleAnswerChange(data.Answers.question, e.target.value)}
                                        />
                                        )
                                    }
                                    <label>{data.Answers[key]}</label>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : data.Answers.type ==='fill-in-the-blank' ? (
                    <div
                        key={index}
                        className='flex flex-col justify-center items-center gap-4 w-96 p-4 bg-blue-200 shadow-md rounded'
                    >
                        <label className='text-md font-bold'>{data.Answers.question}</label>
                        <textarea
                            placeholder='Answer here...'
                            className='w-full p-2 border border-gray-300 rounded'
                            name={data.Answers.question}
                            value={answers[data.Answers.question] || ''}
                            onChange={(e) => handleAnswerChange(data.Answers.question, e.target.value)}
                        />
                    </div>
                ) : (
                    <div
                        key={index}
                        className='flex flex-col justify-center items-center gap-4 w-96 p-4 bg-blue-200 shadow-md rounded'
                    >
                        <label className='text-md font-bold'>{data.Answers.question}</label>
                        <ul className='flex justify-center items-center gap-3'>
                            <li className='p-2 bg-white pl-5 pr-5 rounded-sm cursor-pointer hover:bg-blue-300 focus:bg-blue-300' onClick={() => handleAnswerChange(data.Answers.question,'true')}>True</li>
                            <li className='p-2 bg-white pl-5 pr-5 rounded-sm cursor-pointer hover:bg-blue-300 focus:bg-blue-300' onClick={() => handleAnswerChange(data.Answers.question,'false')}>False</li>  
                        </ul>
                    </div>
                )
            ))}

            <button
                type="submit"
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
                Submit Answers
            </button>
        </form>
        }
         
        {
            openPopup && (
                <div className={`fixed top-50 right-50 w-full h-full bg-black bg-opacity-50 flex justify-center items-center `}>
                    <div className=' flex flex-col justify-center align-middle gap-4 w-96 h-40 p-4 bg-gray-200 shadow-md rounded'>
                        <h1 className='text-center font-bold '>Submit Answer!</h1>
                        <div className='flex justify-center items-center gap-4'>
                            <button className='bg-green-500 text-white p-2 rounded' onClick={() => {setSubm(true);setOpenPopup(false);setShowResults(true)}}>Submit</button>
                            <buttion className='bg-blue-500 text-white p-2 rounded cursor-pointer' onClick={() => setOpenPopup(false)}>Cancle</buttion>
                        </div>
                    </div>
                </div>
            )
        }
    </div>
  )
}

export default Studentver