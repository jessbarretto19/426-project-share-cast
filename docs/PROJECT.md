# Community Theater Costume & Prop Lending System

## Domain

This project simulates a distributed web system that allows community theater groups, schools, and nonprofit performance organizations to browse, reserve, and share costumes, props, and set pieces. Instead of purchasing duplicate items, organizations can search a shared catalog, reserve available inventory, and manage lending schedules through a centralized platform.

## Scalability

As more organizations use the system simultaneously, multiple users may search the catalog, reserve items, or return equipment at the same time. During periods of high demand, such as before theater festivals or school productions, many reservation requests may arrive concurrently. Without proper coordination, two organizations could reserve the same costume or prop, resulting in inconsistent inventory data. If the reservation service becomes unavailable, organizations may be unable to reserve critical items before performances. A distributed architecture allows requests to be handled reliably while keeping inventory synchronized across services.

## Computing for the Common Good

This project supports Computing for the Common Good by helping community arts organizations share existing resources rather than purchasing new costumes and props. Organizations such as the UMass Theatre Guild, Amherst Repertory Company, schools, and local nonprofit theaters benefit from lower production costs and increased access to materials. When the system performs reliably, volunteers, directors, and performers can confidently plan productions using accurate inventory information. If the system is slow or unreliable, duplicate reservations, scheduling conflicts, and canceled performances could negatively impact organizations with limited budgets and volunteers.
