import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const GalleryPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const images = [
    {
      url: 'https://images.unsplash.com/photo-1766160703850-b3a2ccb78d2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBob3RlbCUyMGV4dGVyaW9yfGVufDB8fHx8MTc3NDI3MTg3N3ww&ixlib=rb-4.1.0&q=85',
      title: 'Hotel Exterior',
      category: 'exterior',
    },
    {
      url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBob3RlbCUyMHJvb218ZW58MHx8fHwxNzc0MjcxODc4fDA&ixlib=rb-4.1.0&q=85',
      title: 'Deluxe Room',
      category: 'rooms',
    },
    {
      url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb218ZW58MHx8fHwxNzc0MjcxODc4fDA&ixlib=rb-4.1.0&q=85',
      title: 'Suite',
      category: 'rooms',
    },
    {
      url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBob3RlbCUyMHJvb218ZW58MHx8fHwxNzc0MjcxODc4fDA&ixlib=rb-4.1.0&q=85',
      title: 'Standard Room',
      category: 'rooms',
    },
    {
      url: 'https://images.pexels.com/photos/2290753/pexels-photo-2290753.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      title: 'Restaurant',
      category: 'dining',
    },
    {
      url: 'https://images.pexels.com/photos/7023155/pexels-photo-7023155.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      title: 'Luxury Bathroom',
      category: 'rooms',
    },
    {
      url: 'https://images.pexels.com/photos/6466284/pexels-photo-6466284.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      title: 'Room Service',
      category: 'amenities',
    },
    {
      url: 'https://images.pexels.com/photos/7821345/pexels-photo-7821345.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      title: 'Reception Area',
      category: 'reception',
    },
    {
      url: 'https://images.pexels.com/photos/3510073/pexels-photo-3510073.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      title: 'Hotel Entrance',
      category: 'exterior',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 px-6 lg:px-12 max-w-7xl mx-auto" data-testid="gallery-page">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">EXPLORE</p>
          <h1
            className="text-5xl md:text-6xl font-light tracking-tight mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Photo Gallery
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Take a virtual tour of our beautiful property and luxurious accommodations
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-sm cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
              onClick={() => setSelectedImage(image)}
              data-testid={`gallery-image-${idx}`}
            >
              <div className="aspect-[4/3] relative">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <p className="text-white text-lg font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View
                  </p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-light">{image.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none" data-testid="gallery-lightbox">
          {selectedImage && (
            <div className="relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                data-testid="close-lightbox-btn"
              >
                <X size={24} />
              </button>
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[90vh] object-contain rounded-sm"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {selectedImage.title}
                </h3>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default GalleryPage;
