import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import React, { use, useContext, useEffect, useState } from 'react';
import {v4 as uuid} from "uuid";
import { db } from './firebase';
import { AuthContext } from './context/AuthContext';

const Teacherver = () => {
    const {submitted} = useContext(AuthContext);
    const [questions, setQuestions] = useState([]);
    const [Delete,setDelete] = useState(false);
    const [studentResults, setStudentResults] = useState([]);
    const [viewid, setViewId] = useState('');
    const [view, setView] = useState(false);
    const [viewquestion, setViewQuestion] = useState([]);
    const [openIndex, setOpenIndex] = useState(null);
    const [deletethis, setdeletethis] = useState('');
    const [questionType, setQuestionType] = useState('multiple-choice');
    const [truefalsebutton, setTrueFalseButton] = useState('');
    const [Answers, setAnswers] = useState({
        id: '',
        question: '',
        answer1: '',
        answer2: '',
        answer3: '',
        answer4: '',
        correctAnswer: '',
        file: null,
        mark: 0,
        uploadby: 'teacher',
        type: 'multiple-choice'
    });
    const [blankAnswers, setBlankAnswers] = useState({
        id: '',
        question: '',
        correctAnswer: '',
        mark: 0,
        uploadby: 'teacher',
        type: 'fill-in-the-blank'
    });
    const [trueFalseAnswers, setTrueFalseAnswers] = useState({
        id: '',
        question: '',
        correctAnswer: '',
        mark: 0,
        uploadby: 'teacher',
        type: 'true-false'
    });

      const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
      };

    const handleUpload = async(e) => {
        e.preventDefault();
        setTrueFalseButton('');
        const formType = e.target.formType.value; 
        console.log('input upload ' , e.target)
        const secid = uuid();
        const answersWithId = { ...Answers, id: secid, type: formType };
        const blank = { ...blankAnswers, id: secid, type: formType };
        const tandf = { ...trueFalseAnswers, id: secid, type: formType };
        if (formType === 'fill-in-the-blank') {
            console.log('Uploading question:', blank);
            await setDoc(doc(db, "questions",secid), {
            Answers: blank
            });
            setBlankAnswers({
                id: secid,
                question: '',
                correctAnswer: '',
                mark: 0,
                uploadby: 'teacher'
            });
        } else if (formType === 'multiple-choice') {
            console.log('Uploading question:', answersWithId);
            await setDoc(doc(db, "questions",secid), {
                Answers: answersWithId
            });
            setAnswers({
                id: secid,
                question: '',
                answer1: '',
                answer2: '',
                answer3: '',
                answer4: '',
                correctAnswer: '',
                file: null,
                mark: 0,
                uploadby: 'teacher'
            });
        } else if (formType === 'true-false') {
            console.log('Uploading question:', tandf);
            await setDoc(doc(db, "questions",secid), {
                Answers: tandf
            });
            setTrueFalseAnswers({
                id: secid,
                question: '',
                correctAnswer: '',
                mark: 0,
                uploadby: 'teacher'
            });
        }
    }

    const handleView = async (id) => {
        setViewId(id);
        console.log('Viewing question with id:', id);
        //const q = query(collection(db, "questions"), id);
        const q = doc(db, "questions", id);
        const docSnap = await getDoc(q);
        if (docSnap.exists()) {
            setViewQuestion([docSnap.data().Answers]);
            console.log('view question :', docSnap.data().Answers);
            setView(true);
        } else {
            console.log('No such document!');
        }
        setTrueFalseButton('');
    }

    const handleUpdateNew = async (e) => {
        e.preventDefault();
        console.log('Updating question:', viewquestion[0]);
        await setDoc(doc(db, "questions", viewquestion[0].id),{ Answers : viewquestion[0]});
        setView(false);
        setViewId('');
        setTrueFalseButton('');
    }

     const handleInputChange = (index, field, value) => {
        const updatedQuestions = [...viewquestion];
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
        setViewQuestion(updatedQuestions);
    };

    useEffect(() => {
        const fetch = async () => {
            if (Delete) {
                console.log('Deleting question with id:', deletethis);
                await deleteDoc(doc(db, "questions",deletethis));  
                setDelete(false);
                setdeletethis('');
            } else {
                console.log('No deletion requested');
            }
        }
        fetch();
    }, [deletethis, Delete]);

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
    }, [Answers, Delete,view,blankAnswers,trueFalseAnswers]);

    useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "user"), (querySnapshot) => {
        const resultsArray = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.role === 'student') {
                resultsArray.push(data);
            }
        });
        setStudentResults(resultsArray);
    });

    return () => unsubscribe();
}, []);


  return (
    <div className='w-full min-h-screen p-10 flex justify-center items-center  bg-blue-300'>
        <div className='grid justify-center items-center grid-cols-3 gap-15'>
            <div className='flex flex-col justify-center items-center gap-4'>
                <h1 className='font-bold text-2xl text-white'>Check Results</h1>
                <p className='font-bold text-xl text-white'>You can check the results of the students!</p>
                {
                    studentResults.map((student, index) => (
                        <div key={index} className='w-96 p-4 bg-blue-200 shadow-md rounded'>
                            <div className='flex justify-between items-center gap-4 p-4'>
                                <h1 className='text-xl font-bold'>{student.name}</h1>
                                <p className='text-lg'>Total marks: {student.totalMarks}</p>
                                <button className='bg-blue-500 text-white p-2 rounded' onClick={() => toggleAccordion(index)}>Details</button>
                            </div>
                            
                            {openIndex === index && (
                                <div>
                                    <div className='grid grid-cols-3 w-full gap-4 p-4 '>
                                    <p className='text-m font-bold text-start'>question</p>
                                    <p className='text-base font-bold text-center'>Answer</p>
                                </div>
                                {
                                    student.results.map((result, resIndex) => (
                                    <div key={resIndex} className='grid grid-cols-3 w-full gap-4 p-4 '>
                                        <p className='text-m text-start'>{result.question}</p>
                                        <p className='text-base text-center'>{result.userAnswer}</p>
                                        <div className='flex justify-end items-center'>
                                            {
                                                result.correctAnswer === result.userAnswer ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-green-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-red-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                    </svg>
                                                )
                                            }
                                        </div>
                                    </div>
                                    ))
                                }
                                </div>
                            )}
                            
                        </div>
                    ))
                }
            </div>
            <div className='flex flex-col justify-center items-center gap-4'>
                <h1 className='font-bold text-2xl text-white'>Teacher version</h1>
                <p className='font-bold text-xl text-white'>You can upload questions and check the results!</p>
                <div className='bg-blue-200 shadow-md rounded w-96 p-4 gap-4 flex flex-col justify-center items-center'>
                    <h1 >Choose question type</h1>
                    <div className='grid grid-cols-2 justify-between items-center gap-4 w-full'>
                        <button className='w-full p-3 bg-white rounded-sm hover:bg-green-200' onClick={() => setQuestionType('multiple-choice')} style={{backgroundColor : questionType === 'multiple-choice' ? '#bbf7d0' : 'white'}}>Multiple choise</button>
                        <button className='w-full p-3 bg-white rounded-sm hover:bg-green-200' onClick={() => setQuestionType('fill-in-the-blank')} style={{backgroundColor : questionType === 'fill-in-the-blank' ? '#bbf7d0' : 'white'}}>Fill in the blanks</button>
                        <button className='w-full p-3 bg-white rounded-sm hover:bg-green-200' onClick={() => setQuestionType('true-false')} style={{backgroundColor : questionType === 'true-false' ? '#bbf7d0' : 'white'}}>True False</button>
                    </div>
                {
                    view ?(
                        viewquestion.map((q, index) => (
                            q.type === 'multiple-choice' ? (
                                <form
                                    key={index}
                                    className='flex justify-center items-center gap-4 flex-col'
                                    onSubmit={handleUpdateNew}
                                >
                                    <textarea placeholder='Question' value={q.question} onChange={(e) => handleInputChange(index, 'question', e.target.value)} className='w-full p-2 rounded-md' />
                                    <input placeholder='Answer 1' value={q.answer1} onChange={(e) => handleInputChange(index, 'answer1', e.target.value)} className='w-full p-2 rounded-md' />
                                    <input placeholder='Answer 2' value={q.answer2} onChange={(e) => handleInputChange(index, 'answer2', e.target.value)} className='w-full p-2 rounded-md' />
                                    <input placeholder='Answer 3' value={q.answer3} onChange={(e) => handleInputChange(index, 'answer3', e.target.value)} className='w-full p-2 rounded-md' />
                                    <input placeholder='Answer 4' value={q.answer4} onChange={(e) => handleInputChange(index, 'answer4', e.target.value)} className='w-full p-2 rounded-md' />
                                    <input placeholder='Correct Answer' value={q.correctAnswer} onChange={(e) => handleInputChange(index, 'correctAnswer', e.target.value)} className='w-full p-2 rounded-md' />
                                    <input type='file' className='w-full p-2 rounded-md' />
                                    <input placeholder='Give mark' type='number' value={q.mark} onChange={(e) => handleInputChange(index, 'mark', Number(e.target.value))} className='w-full p-2 rounded-md' />
                                    <div className='flex justify-between gap-4'>
                                        <button type="submit" className='bg-blue-500 text-white p-2 rounded'>Update</button>
                                        <button type="button" onClick={() => {setView(false);setViewId('')}} className='bg-blue-500 text-white p-2 rounded'>Close</button>
                                    </div>
                                </form>
                            ) : questionType === 'fill-in-the-blank' ? (
                                <form
                                    key={index}
                                    className='flex justify-center items-center gap-4 flex-col'
                                    onSubmit={handleUpdateNew}
                                >
                                    <textarea placeholder='Question' value={q.question} onChange={(e) => handleInputChange(index, 'question', e.target.value)} className='w-full p-2 rounded-md' />
                                    <input placeholder='Correct Answer' value={q.correctAnswer} onChange={(e) => handleInputChange(index, 'correctAnswer', e.target.value)} className='w-full p-2 rounded-md' />
                                    <input type='file' className='w-full p-2 rounded-md' />
                                    <input placeholder='Give mark' type='number' value={q.mark} onChange={(e) => handleInputChange(index, 'mark', Number(e.target.value))} className='w-full p-2 rounded-md' />
                                    <div className='flex justify-between gap-4'>
                                        <button type="submit" className='bg-blue-500 text-white p-2 rounded'>Update</button>
                                        <button type="button" onClick={() => {setView(false);setViewId('')}} className='bg-blue-500 text-white p-2 rounded'>Close</button>
                                    </div>
                                </form>
                            ) : (
                                <form key={index} className='flex justify-center items-center gap-4 flex-col w-full' onSubmit={handleUpdateNew}>
                                    <input type="hidden" name="formType" value="true-false" /> 
                                    <textarea placeholder='Question' className='w-full p-2 rounded-md' value={q.question} onChange={(e) => handleInputChange(index, 'question', e.target.value)}></textarea>
                                    <ul className='flex justify-center items-center gap-3'>
                                      <li className='p-2 bg-white pl-5 pr-5 rounded-sm cursor-pointer hover:bg-blue-300' onClick={() => handleInputChange(index,'correctAnswer','true')}>True</li>
                                      <li className='p-2 bg-white pl-5 pr-5 rounded-sm cursor-pointer hover:bg-blue-300' onClick={() => handleInputChange(index,'correctAnswer','false')}>False</li>  
                                    </ul>
                                    <input placeholder='Give mark' type='number' className='w-full p-2 rounded-md' value={q.mark} onChange={(e) => handleInputChange(index, 'mark', Number(e.target.value))}></input>
                                    <div className='flex justify-between gap-4'>
                                        <button type="submit" className='bg-blue-500 text-white p-2 rounded'>Update</button>
                                        <button type="button" onClick={() => {setView(false);setViewId('')}} className='bg-blue-500 text-white p-2 rounded'>Close</button>
                                    </div>
                                </form>
                            )
                        ))
                    ) : (
                            questionType === 'fill-in-the-blank' ? (
                                <form className='flex justify-center items-center gap-4 flex-col w-full' onSubmit={handleUpload}>
                                    <input type="hidden" name="formType" value="fill-in-the-blank" /> 
                                    <textarea placeholder='Question' className='w-full p-2 rounded-md' value={blankAnswers.question} onChange={e => setBlankAnswers({ ...blankAnswers, question: e.target.value })}></textarea>
                                    <input placeholder='Correct Answer' className='w-full p-2 rounded-md' value={blankAnswers.correctAnswer} onChange={e => setBlankAnswers({ ...blankAnswers, correctAnswer: e.target.value })}></input>
                                    <input placeholder='Give mark' type='number' className='w-full p-2 rounded-md' value={blankAnswers.mark} onChange={e => setBlankAnswers({ ...blankAnswers, mark: Number(e.target.value) })}></input>
                                    <button type="submit" className='bg-blue-500 text-white p-2 rounded'>Upload</button>
                                </form>
                            ) : questionType === 'multiple-choice' ? (
                                <form className='flex justify-center items-center gap-4 flex-col' onSubmit={handleUpload}>
                                    <input type="hidden" name="formType" value="multiple-choice" /> 
                                    <textarea placeholder='Question' className='w-full p-2 rounded-md' value={Answers.question} onChange={e => setAnswers({ ...Answers, question: e.target.value })}></textarea>
                                    <input placeholder='Answer 1' className='w-full p-2 rounded-md' value={Answers.answer1} onChange={e => setAnswers({ ...Answers, answer1: e.target.value })}></input>
                                    <input placeholder='Answer 2' className='w-full p-2 rounded-md' value={Answers.answer2} onChange={e => setAnswers({ ...Answers, answer2: e.target.value })}></input>
                                    <input placeholder='Answer 3' className='w-full p-2 rounded-md' value={Answers.answer3} onChange={e => setAnswers({ ...Answers, answer3: e.target.value })}></input>
                                    <input placeholder='Answer 4' className='w-full p-2 rounded-md' value={Answers.answer4} onChange={e => setAnswers({ ...Answers, answer4: e.target.value })}></input>
                                    <input placeholder='Correct Answer' className='w-full p-2 rounded-md' value={Answers.correctAnswer} onChange={e => setAnswers({ ...Answers, correctAnswer: e.target.value })}></input>
                                    <input type='file' className='w-full p-2 rounded-md' onChange={(e) => setAnswers({ ...Answers, file: e.target.files[0] })} />
                                    <input placeholder='Give mark' type='number' className='w-full p-2 rounded-md' value={Answers.mark} onChange={e => setAnswers({ ...Answers, mark: Number(e.target.value) })}></input>
                                    <button type="submit" className='bg-blue-500 text-white p-2 rounded'>Upload</button>
                                </form>
                            ) : (
                                <form className='flex justify-center items-center gap-4 flex-col w-full' onSubmit={handleUpload}>
                                    <input type="hidden" name="formType" value="true-false" /> 
                                    <textarea placeholder='Question' className='w-full p-2 rounded-md' value={trueFalseAnswers.question} onChange={e => setTrueFalseAnswers({ ...trueFalseAnswers, question: e.target.value })}></textarea>
                                    <ul className='flex justify-center items-center gap-3'>
                                      <li className='p-2 bg-white pl-5 pr-5 rounded-sm cursor-pointer hover:bg-blue-300 focus:bg-blue-300 active:bg-blue-300' onClick={() => {setTrueFalseAnswers({...trueFalseAnswers,correctAnswer: 'true'});setTrueFalseButton('true')}} style={{backgroundColor: truefalsebutton === 'true' ? '#93c5fd': 'white'}}>True</li>
                                      <li className='p-2 bg-white pl-5 pr-5 rounded-sm cursor-pointer hover:bg-blue-300 focus:bg-blue-300 active:bg-blue-300' onClick={() => {setTrueFalseAnswers({...trueFalseAnswers,correctAnswer: 'false'});setTrueFalseButton('false')}} style={{backgroundColor: truefalsebutton === 'false' ? '#93c5fd': 'white'}}>False</li>  
                                    </ul>
                                    <input placeholder='Give mark' type='number' className='w-full p-2 rounded-md' value={trueFalseAnswers.mark} onChange={e => setTrueFalseAnswers({ ...trueFalseAnswers, mark: Number(e.target.value) })}></input>
                                    <button type="submit" className='bg-blue-500 text-white p-2 rounded'>Upload</button>
                                </form>
                            )
                    )
                }
                </div>
            </div>
            <div className='flex flex-col justify-center items-center gap-4'>
                <h1 className='font-bold text-2xl text-white'>Questions</h1>
                <p className='font-bold text-xl text-white'>You can Delete any time</p>
                {
                    questions.map((question, index) => (
                        <div key={index} className='flex justify-between items-center gap-4 w-96 p-4 bg-white shadow-md rounded' style={{backgroundColor: viewid === question.Answers.id ? 'aqua' : '#fff'}}>
                            <h5 className=''>{question.Answers.question}</h5>
                            <div className='flex justify-center items-center gap-4'>
                                <button className='bg-blue-500 text-white p-2 rounded' onClick={() => handleView(question.Answers.id)}>View</button>
                                <button className='bg-red-500 text-white p-2 rounded' onClick={() => setdeletethis(question.Answers.id)}>Delete</button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
        {
            deletethis && (
                <div className={`fixed top-50 right-50 w-full h-full bg-black bg-opacity-50 flex justify-center items-center `}>
                    <div className=' flex flex-col justify-center align-middle gap-4 w-96 p-4 bg-white shadow-md rounded'>
                        <h1 className='text-center'>Delete this question.</h1>
                        <div className='flex justify-center items-center gap-4'>
                            <button className='bg-red-500 text-white p-2 rounded' onClick={() => setDelete(true)}>Delete</button>
                            <buttion className='bg-blue-500 text-white p-2 rounded cursor-pointer' onClick={() => {setDelete(false);setdeletethis('')}}>Cancle</buttion>
                        </div>
                    </div>
                </div>
            )
        }
</div>
  )
}

export default Teacherver