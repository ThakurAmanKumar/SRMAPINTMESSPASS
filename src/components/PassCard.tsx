import React from 'react';

interface PassCardProps {
  issueId: string;
  fullName: string;
  regNumber: string;
  photoUrl: string;
  issuedDate: string;
}

export const PassCard = React.forwardRef<HTMLDivElement, PassCardProps>(
  ({ issueId, fullName, regNumber, photoUrl, issuedDate }, ref) => {
    const formattedDate = new Date(issuedDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div
        ref={ref}
        className="mx-auto bg-white overflow-hidden"
        style={{
          width: '360px',
          border: '4px solid #484622',
          borderRadius: '16px',
          backgroundColor: '#efeee3',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* ===== HEADER SECTION ===== */}
        <div
          style={{
            backgroundColor: '#484622',
            padding: '20px 16px',
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 238, 227, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="https://raw.githubusercontent.com/ThakurAmanKumar/webIMG/refs/heads/main/img%20for%20site/SRM_University%2C_Andhra_Pradesh_logo.png"
                alt="Mess Logo"
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* University Name */}
          <div
            style={{
              color: '#efeee3',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '1px',
              marginBottom: '6px',
              fontFamily: 'var(--font-inter, sans-serif)',
            }}
          >
            SRM UNIVERSITY AP
          </div>

          {/* Pass Type */}
          <div
            style={{
              color: '#efeee3',
              fontSize: '14px',
              fontWeight: '700',
              letterSpacing: '0.5px',
              lineHeight: '1.4',
              fontFamily: 'var(--font-poppins, sans-serif)',
            }}
          >
            INTERNATIONAL MESS ACCESS PASS
          </div>
        </div>

        {/* ===== PHOTO SECTION ===== */}
        <div
          style={{
            padding: '20px 16px',
            textAlign: 'center',
            backgroundColor: '#efeee3',
          }}
        >
          <div
            style={{
              width: '110px',
              height: '130px',
              margin: '0 auto',
              border: '3px solid #484622',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(72, 70, 34, 0.15)',
            }}
          >
            <img
              src={photoUrl}
              alt={fullName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>

        {/* ===== STUDENT INFORMATION SECTION ===== */}
        <div
          style={{
            padding: '6px 16px 12px 16px',
            textAlign: 'center',
            backgroundColor: '#efeee3',
          }}
        >
          {/* Name */}
          <div style={{ marginBottom: '12px' }}>
            <div
              style={{
                fontSize: '8px',
                fontWeight: '700',
                color: '#484622',
                letterSpacing: '1.2px',
                marginBottom: '4px',
                fontFamily: 'var(--font-inter, sans-serif)',
                textTransform: 'uppercase',
              }}
            >
              Student Name
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#1a1a1a',
                fontFamily: 'var(--font-poppins, sans-serif)',
                lineHeight: '1.4',
                letterSpacing: '0.3px',
              }}
            >
              {fullName}
            </div>
          </div>

          {/* Registration Number */}
          <div>
            <div
              style={{
                fontSize: '8px',
                fontWeight: '700',
                color: '#484622',
                letterSpacing: '1.2px',
                marginBottom: '4px',
                fontFamily: 'var(--font-inter, sans-serif)',
                textTransform: 'uppercase',
              }}
            >
              Registration Number
            </div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: '600',
                color: '#1a1a1a',
                fontFamily: 'var(--font-inter, sans-serif)',
                letterSpacing: '0.5px',
                lineHeight: '1.5',
              }}
            >
              {regNumber}
            </div>
          </div>
        </div>

        {/* ===== AUTHORIZATION BLOCK ===== */}
        <div
          style={{
            margin: '2px 12px 12px 12px',
            padding: '14px 12px',
            border: '2px solid #484622',
            borderRadius: '8px',
            backgroundColor: '#efeee3',
            boxShadow: '0 2px 8px rgba(72, 70, 34, 0.1)',
          }}
        >
          {/* Authorization Title with Decorative Symbols */}
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#484622',
              letterSpacing: '0.8px',
              marginBottom: '10px',
              textAlign: 'center',
              fontFamily: 'Georgia, "Times New Roman", serif',
              textTransform: 'uppercase',
            }}
          >
            ✦ Authorization ✦
          </div>

          {/* Authorization Text */}
          <div
            style={{
              fontSize: '8.5px',
              lineHeight: '1.7',
              color: '#333333',
              textAlign: 'justify',
              fontFamily: 'var(--font-inter, sans-serif)',
              fontWeight: '400',
              letterSpacing: '0.1px',
            }}
          >
            As per verification by the <span style={{ fontWeight: '700' }}>International Mess Committee, SRM University-AP</span>, the bearer of this pass is authorized to access and use the services of the International Mess.
          </div>
        </div>

        {/* ===== CONTACT SECTION ===== */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: '#efeee3',
            textAlign: 'center',
            borderTop: '1px solid #484622',
          }}
        >
          {/* Contact Label */}
          <div
            style={{
              fontSize: '6px',
              fontWeight: '700',
              color: '#484622',
              letterSpacing: '0.6px',
              marginBottom: '3px',
              fontFamily: 'var(--font-inter, sans-serif)',
              textTransform: 'uppercase',
            }}
          >
            Contact
          </div>

          {/* Committee Name */}
          <div
            style={{
              fontSize: '7.5px',
              fontWeight: '700',
              color: '#484622',
              letterSpacing: '0.2px',
              marginBottom: '2px',
              fontFamily: 'var(--font-poppins, sans-serif)',
              lineHeight: '1.2',
            }}
          >
            International Mess Committee
          </div>

          {/* Email */}
          <div
            style={{
              fontSize: '6.5px',
              fontWeight: '600',
              color: '#484622',
              fontFamily: 'var(--font-inter, sans-serif)',
              letterSpacing: '0.1px',
              lineHeight: '1.3',
            }}
          >
            <span style={{ fontWeight: '700' }}>E-mail :</span> international.mc@srmap.edu.in
          </div>
        </div>

        {/* ===== FOOTER SECTION ===== */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#484622',
            borderTop: '2px solid #484622',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Issue ID */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div
              style={{
                fontSize: '8px',
                fontWeight: '700',
                color: '#efeee3',
                letterSpacing: '0.6px',
                marginBottom: '2px',
                fontFamily: 'var(--font-inter, sans-serif)',
                textTransform: 'uppercase',
              }}
            >
              Issue ID
            </div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#efeee3',
                fontFamily: 'var(--font-inter, sans-serif)',
              }}
            >
              {issueId}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: '1px',
              height: '28px',
              backgroundColor: '#efeee3',
              opacity: 0.4,
            }}
          />

          {/* Issued Date */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div
              style={{
                fontSize: '8px',
                fontWeight: '700',
                color: '#efeee3',
                letterSpacing: '0.6px',
                marginBottom: '2px',
                fontFamily: 'var(--font-inter, sans-serif)',
                textTransform: 'uppercase',
              }}
            >
              Issued Date
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#efeee3',
                fontFamily: 'var(--font-inter, sans-serif)',
              }}
            >
              {formattedDate}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PassCard.displayName = 'PassCard';
