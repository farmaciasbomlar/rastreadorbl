
import React, { useState, useRef, useEffect } from 'react';
import { BotIcon } from './icons/BotIcon';
import { XIcon } from './icons/XIcon';
import { sendChatToGemini } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const botResponse = await sendChatToGemini(input, messages);
            const botMessage: Message = { sender: 'bot', text: botResponse };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: Message = { sender: 'bot', text: 'Desculpe, ocorreu um erro. Tente novamente.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-[#00ADAC] to-[#F16708] rounded-full shadow-lg text-white flex items-center justify-center transition-transform hover:scale-110"
                aria-label="Toggle Chatbot"
            >
                {isOpen ? <XIcon className="h-8 w-8" /> : <BotIcon className="h-8 w-8" />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm h-[60vh] bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl flex flex-col overflow-hidden">
                    <header className="flex items-center justify-between p-4 border-b border-gray-700/50">
                        <div className="flex items-center gap-2">
                           <SparklesIcon className="h-6 w-6 text-[#F16708]" />
                           <h3 className="font-bold text-white">Assistente Gemini</h3>
                        </div>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-[#00ADAC] text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                        <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-700/50">
                        <div className="flex items-center bg-gray-700 rounded-lg">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Pergunte algo..."
                                className="flex-1 bg-transparent p-3 text-sm text-gray-200 placeholder-gray-400 focus:outline-none"
                                disabled={isLoading}
                            />
                            <button onClick={handleSend} disabled={isLoading} className="p-3 text-[#00ADAC] hover:text-[#F16708] disabled:opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
