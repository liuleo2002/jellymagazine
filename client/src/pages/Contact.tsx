import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EditableContent } from "@/components/EditableContent";
import { contactSchema, type Contact } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Mail, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const { toast } = useToast();

  const form = useForm<Contact>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: Contact) => {
      await apiRequest('POST', '/api/contact', data);
    },
    onSuccess: () => {
      form.reset();
      toast({
        title: "Message Sent! 🎉",
        description: "Thank you for reaching out! We'll get back to you within 24 hours.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-24 h-24 bg-jelly-pink/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-jelly-blue/10 rounded-full animate-bounce-slow"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-jelly-yellow/10 rounded-full animate-float"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <EditableContent
            section="contact"
            contentKey="title"
            defaultValue="Get In Touch!"
            as="h1"
            className="text-6xl font-bold bg-gradient-to-r from-jelly-pink via-jelly-purple to-jelly-blue bg-clip-text text-transparent mb-6"
          />
          <EditableContent
            section="contact"
            contentKey="description"
            defaultValue="Have a colorful idea or want to collaborate? We'd love to hear from you!"
            as="p"
            className="text-2xl text-gray-600 max-w-2xl mx-auto"
            multiline
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="jelly-card bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Send us a message</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => contactMutation.mutate(data))} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Your Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your name"
                          className="border-2 border-jelly-pink/30 rounded-2xl focus:border-jelly-pink text-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          className="border-2 border-jelly-purple/30 rounded-2xl focus:border-jelly-purple text-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Message</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder="Tell us about your colorful ideas..."
                          className="border-2 border-jelly-blue/30 rounded-2xl focus:border-jelly-blue text-lg resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={contactMutation.isPending}
                  className="jelly-button w-full py-4 bg-gradient-to-r from-jelly-pink via-jelly-purple to-jelly-blue text-white font-bold text-lg rounded-2xl shadow-lg"
                >
                  {contactMutation.isPending ? "Sending..." : "Send Message"} <Send className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </Form>
          </div>

          {/* Contact Info & Social Links */}
          <div className="space-y-8">
            <div className="jelly-card bg-gradient-to-br from-jelly-pink/10 to-jelly-purple/10 rounded-3xl p-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-6">Connect With Us</h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-jelly-pink rounded-full flex items-center justify-center">
                    <Mail className="text-white h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Email</p>
                    <p className="text-gray-600">hello@jellymagazine.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-jelly-purple rounded-full flex items-center justify-center">
                    <MapPin className="text-white h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Location</p>
                    <p className="text-gray-600">Creative District, Digital City</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-jelly-blue rounded-full flex items-center justify-center">
                    <Clock className="text-white h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Response Time</p>
                    <p className="text-gray-600">Usually within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="jelly-card bg-gradient-to-br from-jelly-coral/10 to-jelly-yellow/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Follow Our Journey</h3>
              
              <div className="flex justify-center space-x-6">
                <a href="#" className="jelly-button w-14 h-14 bg-jelly-pink rounded-full flex items-center justify-center text-white hover:bg-jelly-coral transition-colors">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="jelly-button w-14 h-14 bg-jelly-purple rounded-full flex items-center justify-center text-white hover:bg-jelly-blue transition-colors">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" className="jelly-button w-14 h-14 bg-jelly-blue rounded-full flex items-center justify-center text-white hover:bg-jelly-mint transition-colors">
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
                <a href="#" className="jelly-button w-14 h-14 bg-jelly-coral rounded-full flex items-center justify-center text-white hover:bg-jelly-yellow transition-colors">
                  <i className="fab fa-dribbble text-xl"></i>
                </a>
                <a href="#" className="jelly-button w-14 h-14 bg-jelly-yellow rounded-full flex items-center justify-center text-white hover:bg-jelly-pink transition-colors">
                  <i className="fab fa-youtube text-xl"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
