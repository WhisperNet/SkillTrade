import axios from "axios"

export default ({ req }: { req: any }) => {
  if (typeof window === "undefined") {
    // Server-side execution
    console.log("[SERVER] Creating axios instance for server-side")
    return axios.create({
      baseURL: "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    })
  } else {
    // Client-side execution
    console.log("[BROWSER] Creating axios instance for client-side")
    return axios.create({
      baseURL: "/",
    })
  }
}
