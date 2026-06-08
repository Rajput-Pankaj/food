import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import { MdLocationOn, MdPhone, MdEmail, MdAccessTime } from 'react-icons/md';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function Contact() {
  useDocumentTitle('Contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ UPDATED handleSubmit (merged)
  const handleSubmit = (e) => {
    e.preventDefault();

    // validation
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill all required fields ❌");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      alert("Message sent successfully ✅");

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      setIsSubmitting(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <MdLocationOn className="w-6 h-6" />,
      title: "Our Location",
      details: "123 Food Street, Kanpur  City, Foodland",
      link: "https://www.google.com/maps/dir//Good+Food+Restaurant,+11,+W-2,+Juhi+Kalan,+Damodar+Nagar,+Kanpur,+Uttar+Pradesh+208027/@26.6364954,80.9318324,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x399c47b7cd158bc5:0x4eba4d74c7aeae75!2m2!1d80.3066651!2d26.4270233?entry=ttu&g_ep=EgoyMDI2MDQxNC4wIKXMDSoASAFQAw%3D%3D"
    },
    {
      icon: <MdPhone className="w-6 h-6" />,
      title: "Phone Number",
      details: "+91 8429168953",
      link: "tel:+91 8429168953"
    },
    {
      icon: <MdEmail className="w-6 h-6" />,
      title: "Email Address",
      details: "pankajkumarrajput1116@gmail.com",
      link: "mailto:pankajkumarrajput1116@gmail.com"
    },
    {
      icon: <MdAccessTime className="w-6 h-6" />,
      title: "Working Hours",
      details: "24/7 Delivery Available",
      link: "#"
    }
  ];

  const faqItems = [
    {
      question: "What are your delivery areas?",
      answer: "We deliver to all areas within a 10-mile radius of our kitchen."
    },
    {
      question: "How long does delivery take?",
      answer: "Our standard delivery time is 30-45 minutes."
    },
    {
      question: "Do you offer catering services?",
      answer: "Yes! We provide catering for events and parties."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cards and digital wallets."
    }
  ];

  return (
    <PageLayout>
      {/* Hero */}
      <div className="bg-green-600 text-white py-16 text-center">
        <h1 className="text-5xl font-bold">Contact Us</h1>
        <p className="text-xl mt-4">
          We'd love to hear from you!
        </p>
      </div>

      {/* Info */}
      <div className="py-10 px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contactInfo.map((info) => (
          <a
            key={info.title}
            href={info.link}
            target={info.link.startsWith('http') ? '_blank' : undefined}
            rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="bg-white p-6 rounded shadow text-center hover:shadow-md transition-shadow block"
          >
            <div className="text-green-500 mb-2 flex justify-center">{info.icon}</div>
            <h3 className="font-bold">{info.title}</h3>
            <p className="text-gray-600 text-sm">{info.details}</p>
          </a>
        ))}
      </div>

      {/* FORM */}
      <div className="grid lg:grid-cols-2 gap-10 px-6 pb-16">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Send us a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="w-full p-2 border rounded"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full p-2 border rounded"
            />

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone"
              className="w-full p-2 border rounded"
            />

            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Subject"
              className="w-full p-2 border rounded"
            />

            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Message"
              className="w-full p-2 border rounded"
            ></textarea>

            <button
              type="submit"
              className="bg-green-500 text-white w-full py-2 rounded"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>

          </form>
        </div>

        {/* Right side */}
        <div className="bg-white p-2 rounded shadow overflow-hidden min-h-[300px]">
          <iframe
            title="FoodExpress location map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3600.0!2d80.3066651!3d26.4270233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399c47b7cd158bc5%3A0x4eba4d74c7aeae75!2sGood%20Food%20Restaurant!5e0!3m2!1sen!2sin!4v1700000000000"
            className="w-full h-[300px] border-0 rounded"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white p-10">
        <h2 className="text-3xl font-bold text-center mb-6">
          Frequently Asked Questions
        </h2>

        {faqItems.map((faq, i) => (
          <div key={i} className="mb-4">
            <h4 className="font-bold">{faq.question}</h4>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>

    </PageLayout>
  );
}

export default Contact;