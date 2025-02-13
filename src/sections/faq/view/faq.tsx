/* eslint-disable react/button-has-type */
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { BASE_URL, X_API_KEY } from 'src/components/Urls/BaseApiUrls';

const FAQSection = () => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/v1/faq/list`, {
          headers: {
            'x-api-key': X_API_KEY,
          },
        });
        setFaqs(response.data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };

    fetchFaqs();
  }, []);

  return (
    <section className="py-4">
      <div className="container mx-auto px-4">
        <div className="text-left mb-12 pl-2">
          <h1 className="font-bold text-5xl text-purple-800 mb-6">
            Frequently Asked Question&apos;s
          </h1>
          <p className="text-gray-700">
            Here you will find the answers to the frequently asked questions.
          </p>
        </div>
        <div className="max-w-xl mx-auto lg:max-w-none">
          <div className="flex flex-wrap -mx-4 mb-12">
            {faqs
              .sort((a: any, b: any) => moment(b.updated_at).unix() - moment(a.updated_at).unix())
              .map((faq: any) => (
                <div key={faq.id} className="w-full lg:w-1/2 px-4 mb-4">
                  <button
                    className="flex w-full py-4 px-8 items-start justify-between text-left shadow-md rounded-2xl"
                    onClick={() => setOpenAccordion(openAccordion === faq.id ? null : faq.id)}
                  >
                    <div className="pr-5 w-full">
                      <h5 className="text-lg text-purple-900 font-medium">{faq.question}</h5>
                      <div
                        className={`overflow-hidden transition-all w-full duration-500 ${openAccordion === faq.id ? 'max-h-screen' : 'max-h-0'}`}
                      >
                        <p className="text-gray-700 mt-4">{faq.answer}</p>
                        {/* <p className="text-sm text-right w-full text-gray-500">
                          {moment(faq.updated_at).format('MMMM Do YYYY, h:mm a')}
                        </p> */}
                      </div>
                    </div>
                    <span className="flex-shrink-0">
                      {openAccordion === faq.id ? (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5.69995 12H18.3"
                            stroke="#1D1F1E"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 5.69995V18.3"
                            stroke="#1D1F1E"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5.69995 12H18.3"
                            stroke="#1D1F1E"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>
              ))}
          </div>
          <div className="max-w-7xl pl-2 text-left">
            <h5 className="text-xl font-medium mb-4">Still have questions?</h5>
            <p className="text-gray-700">
              <span>For assistance, please visit our </span>
              <a
                href="https://imcwire.com/contact/"
                style={{ color: 'blue', textDecoration: 'underline' }}
                target="_blank"
                rel="noreferrer"
              >
                <b> Contact Us</b>
              </a>
              <span>
                . Our dedicated team is ready to help you on your journey to more sustainable
                future.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
