FROM public.ecr.aws/lambda/nodejs:20.2025.03.25.16

RUN dnf install -y git

WORKDIR ${LAMBDA_TASK_ROOT}

RUN git clone -b master https://github.com/OptiQuantTeam/BackEnd.git .

RUN npm install

CMD ["index.handler"]