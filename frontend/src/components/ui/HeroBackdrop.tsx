import Image from "next/image";
import { media } from "@/lib/site";

/** Photo behind a navy page hero: darkened towards the text side so the white type stays readable. */
export function HeroBackdrop({ src }: { src?: string }) {
  return (
    <>
      {src && <Image src={src} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />}
      <div aria-hidden="true" className={`absolute inset-0 -z-10 ${src ? "bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy-deep/45" : ""}`} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.12]" style={{ backgroundImage: `url(${media.topo})` }} />
    </>
  );
}
