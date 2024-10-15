import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl } from "@/components/ui/form";
import { FaUser , FaEnvelope, FaDollarSign, FaBriefcase, FaLaptopCode, FaLinkedin, FaGithub, FaTwitter, FaFileAlt } from 'react-icons/fa';
import { MdLocationOn, MdContactPhone } from 'react-icons/md';
import { FaRegFileCode } from "react-icons/fa6";
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

const FreelancerContent = () => {
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
      name: "",
      email: "",
      photoFile: null,
      resumeFile: null,
      address: "",
      mobileNo: "",
      skills: "",
      qualification: "",
      hourlyRate: "",
      experience: "",
      workingType: "",
      linkedin: "",
      github: "",
      twitter: "",
      portfolioURL: "",
    },
  });
  

  function onSubmit(values) {
    setIsLoading(true);

    const requiredFields = [
      'name', 'email', 'photoFile', 'resumeFile', 'address', 'mobileNo',
      'skills', 'qualification', 'hourlyRate', 'experience', 'workingType'
    ];

    const emptyFields = requiredFields.filter(field => !values[field]);

    if (emptyFields.length > 0) {
      toast.error(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      setIsLoading(false);
      return;
    }

    const {
      name, email, photoFile, resumeFile, address, mobileNo, skills, qualification,
      hourlyRate, experience, workingType, linkedin, github, twitter, portfolioURL
    } = values;

    const saveFreelancer = async () => {
      try {
        const photoUrl = await uploadFile(photoFile[0], 'profiles');
        const resumeUrl = await uploadFile(resumeFile[0], 'resumes');

        const user = auth.currentUser ;
        if (!user) {
          throw new Error("User  is not authenticated");
        }

        const userId = user.uid;
        const userRef = doc(db, "users", userId);
        const freelancersRef = collection(userRef, "freelancer");

        await addDoc(freelancersRef, {
          name, email, photoFile: photoUrl, resumeFile: resumeUrl, address, mobileNo, skills, qualification,
          hourlyRate, experience, workingType, linkedin, github, twitter, portfolioURL
        });

        toast.success("Freelancer profile created successfully!");
        navigate("/");
      } catch (error) {
        console.error("Error saving freelancer data:", error);
        toast.error("An error occurred while saving the freelancer data.");
      } finally {
        setIsLoading(false);
      }
    };

    saveFreelancer();
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-100 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white shadow-2xl rounded-3xl p-8 sm:p-12">
            <section className="text-center space-y-4">
              <h1 className="text-5xl font-bold text-violet-800">Freelancer Registration</h1>
              <p className="text-xl text-violet- 600">Please provide your professional details</p>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-semibold flex items-center text-violet-700 border-b pb-3">
                <FaLaptopCode className="w-8 h-8 mr-3 text-violet-500" /> Freelancer Information
              </h2>

              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="name"
                label="Full Name"
                placeholder="John Doe"
                icon={<FaUser  className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="email"
                label="Email"
                placeholder="freelancer@example.com"
                icon={<FaEnvelope className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="address"
                label="Address"
                placeholder="123 Freelancer Street, City, State, ZIP"
                icon={<MdLocationOn className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.PHONE_INPUT}
                control={form.control}
                name="mobileNo"
                label="Mobile Number"
                placeholder="{+91} 123-4567-890"
                icon={<MdContactPhone className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="skills"
                label="Skills"
                placeholder="e.g., Web Development, Graphic Design, etc."
                icon={<FaLaptopCode className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="qualification"
                label="Qualification"
                placeholder="e.g., Bachelor's in Computer Science"
                icon={<FaUser Graduate className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="hourlyRate"
                label="Hourly Rate"
                placeholder="e.g., 50 USD"
                icon={<FaDollarSign className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="experience"
                label="Experience (in years)"
                placeholder="e.g., 5"
                icon={<FaBriefcase className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.RADIO}
                control={form.control}
                name="workingType"
                label="Employment Type"
                options={[
                  { value: 'Freelancer', label: 'Freelancer' },
                  { value: 'Full-Time', label: 'Full Time' },
                  { value: 'Part-Time', label: 'Part Time' }
                ]}
                icon={<FaBriefcase className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.SKELETON}
                control={form.control}
                name="photoFile"
                label="Profile Photo"
                renderSkeleton={(field) => (
                  <FormControl>
                    <FileUploader files={field.value} onChange={field.onChange} />
                  </FormControl>
                )}
                icon={<FaFileAlt className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.SKELETON}
                control={form.control}
                name="resumeFile"
                label="Resume"
                renderSkeleton={(field) => (
                  <FormControl>
                    <FileUploader files={field.value} onChange={field.onChange} />
                  </FormControl>
                )}
                icon={<FaFileAlt className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="linkedin"
                label="LinkedIn Profile"
                placeholder="https://www.linkedin.com/in/your-profile"
                icon={<FaLinkedin className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="github"
                label="GitHub Profile"
                placeholder="https://github.com/your-profile"
                icon={<FaGithub className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="twitter"
                label="Twitter Profile"
                placeholder="https://twitter.com/your-profile"
                icon={<FaTwitter className="text-violet-500" />}
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="portfolioURL"
                label="Portfolio Link (Optional)"
                placeholder="https://twitter.com/your-profile"
                icon={<FaRegFileCode className="text-violet-500" />}
              />
            </section>

            <SubmitButton isLoading={isLoading} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from -violet-700 hover:to-indigo-700 text-white text-xl py-4 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">Register</SubmitButton>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default function FreelancerForm() {
  return (
    <AuthProvider>
      <FreelancerContent />
    </AuthProvider>
  );
}