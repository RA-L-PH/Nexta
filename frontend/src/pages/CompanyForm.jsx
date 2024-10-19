import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl } from "@/components/ui/form";
import { FaBuilding, FaEnvelope, FaPhone, FaGlobe, FaFileAlt } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import CustomFormField, { FormFieldType } from "@/components/CustomFormField";
import SubmitButton from "@/components/SubmitButton";
import FileUploader from "@/components/FileUploader";
import { collection, addDoc, doc, getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { AuthProvider } from '@/contexts/authContext';
import { getAuth } from "firebase/auth";

const db = getFirestore();
const storage = getStorage();
const auth = getAuth();

const CompanyContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const uploadFile = async (file, folder) => {
    if (!file) return null;
    const storageRef = ref(storage, `${folder}/${uuidv4()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const form = useForm({
    defaultValues: {
      companyName: "",
      companyAddress: "",
      logoFile: null,
      phoneNumber: "",
      email: "",
      websiteURL: "",
      missionStatement: "",
      companyHistory: "",
      productsServices: "",
    },
  });

  function onSubmit(values) {
    setIsLoading(true);

    const requiredFields = [
      'companyName', 'companyAddress', 'logoFile', 'phoneNumber', 'email', 'websiteURL',
      'missionStatement', 'companyHistory', 'productsServices'
    ];

    const emptyFields = requiredFields.filter(field => !values[field]);

    if (emptyFields.length > 0) {
      toast.error(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      setIsLoading(false);
      return;
    }

    const {
      companyName, companyAddress, logoFile, phoneNumber, email, websiteURL,
      missionStatement, companyHistory, productsServices
    } = values;

    const saveCompany = async () => {
      try {
        const logoUrl = await uploadFile(logoFile[0], 'company-logos');

        const user = auth.currentUser;
        if (!user) {
          throw new Error("User is not authenticated");
        }

        const userId = user.uid;
        const userRef = doc(db, "users", userId);
        const companiesRef = collection(userRef, "Companies");

        await addDoc(companiesRef, {
          companyName, companyAddress, logoFile: logoUrl, phoneNumber, email, websiteURL,
          missionStatement, companyHistory, productsServices
        });

        toast.success("Company profile created successfully!");
        navigate("/");
      } catch (error) {
        console.error("Error saving company data:", error);
        toast.error("An error occurred while saving the company data.");
      } finally {
        setIsLoading(false);
      }
    };

    saveCompany();
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-100 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white shadow-2xl rounded-3xl p-8 sm:p-12">
            <section className="text-center space-y-4">
              <h1 className="text-5xl font-bold text-violet-800">Company Registration</h1>
              <p className="text-xl text-violet-600">Please provide your company details</p>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-semibold flex items-center text-violet-700 border-b pb-3">
                <FaBuilding className="w-8 h-8 mr-3 text-violet-500" /> Company Information
              </h2>

              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="companyName"
                label="Company Name"
                placeholder="ABC Corporation"
                icon={<FaBuilding className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="companyAddress"
                label="Company Address"
                placeholder="123 Business Park, City, State, ZIP"
                icon={<MdLocationOn className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.PHONE_INPUT}
                control={form.control}
                name="phoneNumber"
                label="Phone Number"
                placeholder="{+91} 123-4567-890"
                icon={<FaPhone className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="email"
                label="Email Address"
                placeholder="contact@company.com"
                icon={<FaEnvelope className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="websiteURL"
                label="Website URL"
                placeholder="https://www.companywebsite.com"
                icon={<FaGlobe className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.SKELETON}
                control={form.control}
                name="logoFile"
                label="Company Logo"
                renderSkeleton={(field) => (
                  <FormControl>
                    <FileUploader files={field.value} onChange={field.onChange} />
                  </FormControl>
                )}
                icon={<FaFileAlt className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="missionStatement"
                label="Mission Statement"
                placeholder="Brief statement about the company’s purpose"
              />
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="companyHistory"
                label="Company History"
                placeholder="Background information about the company"
              />
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="productsServices"
                label="Products/Services Offered"
                placeholder="Description of products or services offered by the company"
              />
            </section>

            <SubmitButton isLoading={isLoading} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xl py-4 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">Register</SubmitButton>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default function FormPage() {
  return (
    <AuthProvider>
      <CompanyContent />
    </AuthProvider>
  );
}
